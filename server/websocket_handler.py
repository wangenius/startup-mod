from fastapi import WebSocket, WebSocketDisconnect
import json
import logging

from models import Player, MessageType
from connection_manager import connection_manager
from room_manager import room_manager
from game_handler import game_handler

logger = logging.getLogger(__name__)


class WebSocketHandler:
    """WebSocket处理器"""
    
    @staticmethod
    async def handle_connection(websocket: WebSocket):
        """处理WebSocket连接"""
        await websocket.accept()
        
        try:
            # 等待客户端发送连接信息
            data = await websocket.receive_text()
            connect_data = json.loads(data)
            
            player_name = connect_data.get("player_name")
            room_id = connect_data.get("room_id")
            
            if not player_name or not room_id:
                await websocket.close(code=4000, reason="缺少玩家名称或房间ID")
                return
            
            # 建立连接
            await connection_manager.connect(websocket, player_name)
            
            # 检查房间是否存在
            room = room_manager.get_room(room_id)
            if not room:
                await websocket.close(code=4004, reason=f"房间 {room_id} 不存在")
                return
                
            # 检查玩家是否已在房间中，如果不在则加入
            player = room.get_player(player_name)
            if not player:
                # 玩家不在房间中，需要加入
                room = room_manager.join_room(player_name, room_id)
                player = room.get_player(player_name)
                is_reconnect = False
            else:
                # 玩家已在房间中，设置为在线状态（重连）
                player.is_online = True
                is_reconnect = True
                
            connection_manager.join_room(player_name, room.room_id)

            # 只有在新加入时才广播玩家加入消息
            if not is_reconnect:
                await connection_manager.broadcast_to_room(
                    room.room_id,
                    {
                        "type": MessageType.PLAYER_JOIN,
                        "data": {
                            "player_name": player_name,
                            "players": [
                                {
                                    "name": p.name, 
                                    "is_online": p.is_online,
                                    "role": p.role,
                                    "startup_idea": p.startup_idea,
                                    "isHost": p.is_host
                                } for p in room.players
                            ],
                        },
                    },
                )
            else:
                # 重连时，只向其他玩家发送玩家列表更新
                await connection_manager.broadcast_to_room(
                    room.room_id,
                    {
                        "type": MessageType.PLAYER_JOIN,
                        "data": {
                            "player_name": player_name,
                            "players": [
                                {
                                    "name": p.name, 
                                    "is_online": p.is_online,
                                    "role": p.role,
                                    "startup_idea": p.startup_idea,
                                    "isHost": p.is_host
                                } for p in room.players
                            ],
                        },
                    },
                    exclude_player=player_name
                )
            
            # 发送连接成功消息，包含当前游戏状态信息
            connection_data = {
                "type": MessageType.CONNECTION_SUCCESS,
                "data": {
                    "room_id": room_id,
                    "player_name": player_name,
                    "is_reconnect": is_reconnect,
                    "game_state": room.game_state.value,
                    "current_round": room.current_round,
                    "players": [
                        {
                            "name": p.name, 
                            "is_online": p.is_online,
                            "role": p.role,
                            "startup_idea": p.startup_idea,
                            "isHost": p.is_host
                        } for p in room.players
                    ]
                }
            }
            
            # 如果游戏正在进行中，发送额外的状态信息
            if room.game_state == "role_selection":
                connection_data["data"]["selected_roles"] = room.get_selected_roles()
            elif room.game_state == "playing":
                from models import ROUND_INFO
                connection_data["data"]["round_info"] = ROUND_INFO.get(room.current_round, "")
                if room.current_round in room.round_actions:
                    connection_data["data"]["player_actions"] = room.round_actions[room.current_round]
            elif room.game_state == "finished" and room.game_result:
                connection_data["data"]["game_result"] = room.game_result
                
            await websocket.send_text(json.dumps(connection_data))
            
        except ValueError as e:
            await websocket.close(code=4004, reason=str(e))
            return
        except Exception as e:
            await websocket.close(code=4001, reason=f"连接失败: {str(e)}")
            return

        try:
            while True:
                # 接收消息
                data = await websocket.receive_text()
                message_data = json.loads(data)

                # 处理消息
                await WebSocketHandler.handle_message(player_name, message_data)

        except WebSocketDisconnect:
            await WebSocketHandler.handle_disconnect(player_name)

    @staticmethod
    async def handle_message(player_name: str, message_data: dict):
        """处理WebSocket消息"""
        try:
            message_type = message_data.get("type")
            data = message_data.get("data", {})
            
            logger.info(f"收到玩家 {player_name} 的消息: {message_type}")

            # 根据消息类型分发处理
            if message_type == "startup_idea":
                await game_handler.handle_startup_idea(player_name, data.get("idea"))
            elif message_type == "start_game":
                await game_handler.handle_start_game(player_name)
            elif message_type == "select_role":
                await game_handler.handle_role_selection(player_name, data.get("role"))
            elif message_type == "game_action":
                await game_handler.handle_game_action(player_name, data)
            else:
                logger.warning(f"未知消息类型: {message_type}")

        except Exception as e:
            logger.error(f"处理WebSocket消息失败: {e}")

    @staticmethod
    async def handle_disconnect(player_name: str):
        """处理玩家断开连接"""
        connection_manager.disconnect(player_name)

        # 处理玩家离线
        room_id = connection_manager.get_player_room(player_name) or ""
        if room_id:
            room = room_manager.get_room(room_id)
            if room:
                room.remove_player(player_name)
                logger.info(f"玩家 {player_name} 离开房间 {room_id}")

                # 广播玩家离线
                await connection_manager.broadcast_to_room(
                    room_id,
                    {
                        "type": MessageType.PLAYER_LEAVE,
                        "data": {
                            "player_name": player_name,
                            "players": [
                                {
                                    "name": p.name, 
                                    "is_online": p.is_online,
                                    "role": p.role,
                                    "startup_idea": p.startup_idea,
                                    "isHost": p.is_host
                                } for p in room.players
                            ],
                        },
                    },
                )


# 全局WebSocket处理器实例
websocket_handler = WebSocketHandler()