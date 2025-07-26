from typing import Dict, Optional
from datetime import datetime
import logging

from models import GameState, Role, MessageType, ROLE_DEFINITIONS, ROUND_INFO
from connection_manager import connection_manager
from room_manager import room_manager

logger = logging.getLogger(__name__)


class GameHandler:
    """游戏逻辑处理器"""
    
    @staticmethod
    async def handle_startup_idea(player_name: str, idea: str):
        """处理创业想法提交"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 设置玩家的创业想法
        player.startup_idea = idea
        logger.info(f"玩家 {player_name} 提交创业想法: {idea}")
        
        # 广播玩家想法提交状态更新
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.PLAYER_JOIN,  # 复用PLAYER_JOIN消息类型来更新玩家列表
                "data": {
                    "player_name": player_name,
                    "players": [
                        {
                            "name": p.name, 
                            "is_online": p.is_online,
                            "startup_idea": p.startup_idea,
                            "role": p.role,
                            "isHost": p.is_host
                        } for p in room.players
                    ],
                }
            }
        )
        
        # 检查是否所有玩家都提交了想法
        if room.all_players_have_ideas():
            # 选择一个想法作为团队的创业想法（这里简单选择第一个）
            room.startup_idea = room.get_online_players()[0].startup_idea
            logger.info(f"房间 {room_id} 确定创业想法: {room.startup_idea}")
            
            # 广播所有想法已提交完成，可以开始游戏
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.IDEAS_COMPLETE,
                    "data": {
                        "startup_idea": room.startup_idea,
                        "players": [
                            {
                                "name": p.name, 
                                "is_online": p.is_online,
                                "startup_idea": p.startup_idea,
                                "role": p.role,
                                "isHost": p.is_host
                            } for p in room.players
                        ],
                    }
                }
            )

    @staticmethod
    async def handle_start_game(player_name: str):
        """处理开始游戏"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player or not player.is_host:
            return

        # 只有在大厅状态且房主操作时才能开始游戏
        if room.game_state == GameState.LOBBY:
            room.game_state = GameState.ROLE_SELECTION
            logger.info(f"房间 {room_id} 开始游戏，进入角色选择阶段")
            
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_START,
                    "data": {
                        "startup_idea": room.startup_idea,
                        "roles": ROLE_DEFINITIONS
                    }
                }
            )

    @staticmethod
    async def handle_role_selection(player_name: str, role: str):
        """处理角色选择"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 将角色ID转换为小写以匹配枚举值
        role_lower = role.lower()
        
        # 检查角色是否有效
        if role_lower not in Role.__members__.values():
            return

        # 检查角色是否已被选择
        role_taken = any(p.role == role_lower for p in room.players if p.name != player_name)
        if role_taken:
            return

        # 设置玩家角色
        player.role = Role(role_lower)
        logger.info(f"玩家 {player_name} 选择角色: {role}")
        
        # 广播角色选择
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROLE_SELECTED,
                "data": {
                    "selectedRoles": room.get_selected_roles(),
                    "players": [
                        {
                            "name": p.name, 
                            "is_online": p.is_online,
                            "role": p.role,
                            "startup_idea": p.startup_idea,
                            "isHost": p.is_host
                        } for p in room.players
                    ],
                }
            }
        )
        
        # 检查是否所有玩家都选择了角色
        if room.all_players_have_roles():
            room.game_state = GameState.PLAYING
            room.current_round = 1
            logger.info(f"房间 {room_id} 所有角色已选择，开始第1轮游戏")
            
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.ROLES_COMPLETE,
                    "data": {
                        "roundInfo": ROUND_INFO[1]
                    }
                }
            )

    @staticmethod
    async def handle_game_action(player_name: str, action_data: Dict):
        """处理游戏行动"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room or room.game_state != GameState.PLAYING:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 构建行动数据
        action = {
            "player": player_name,
            "role": player.role,
            "action": action_data.get("action"),
            "reason": action_data.get("reason"),
            "timestamp": datetime.now().isoformat()
        }
        
        room.add_round_action(room.current_round, action)
        logger.info(f"玩家 {player_name} 提交第{room.current_round}轮行动: {action['action']}")
        
        # 广播行动提交
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ACTION_SUBMITTED,
                "data": {
                    "playerActions": room.round_actions.get(room.current_round, []),
                    "waitingForPlayers": not room.all_players_submitted_actions(room.current_round)
                }
            }
        )
        
        # 检查是否所有玩家都提交了行动
        if room.all_players_submitted_actions(room.current_round):
            await GameHandler._handle_round_complete(room_id, room)

    @staticmethod
    async def _handle_round_complete(room_id: str, room):
        """处理轮次完成"""
        logger.info(f"房间 {room_id} 第{room.current_round}轮完成")
        
        # 广播轮次完成
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_COMPLETE,
                "data": {
                    "round": room.current_round
                }
            }
        )
        
        # 检查是否游戏结束
        if room.current_round >= 5:
            await GameHandler._handle_game_complete(room_id, room)
        else:
            await GameHandler._start_next_round(room_id, room)

    @staticmethod
    async def _handle_game_complete(room_id: str, room):
        """处理游戏完成"""
        room.game_state = GameState.FINISHED
        room.game_result = room.calculate_game_result()
        logger.info(f"房间 {room_id} 游戏结束")
        
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.GAME_COMPLETE,
                "data": {
                    "result": room.game_result
                }
            }
        )

    @staticmethod
    async def _start_next_round(room_id: str, room):
        """开始下一轮"""
        room.current_round += 1
        logger.info(f"房间 {room_id} 开始第{room.current_round}轮")
        
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_START,
                "data": {
                    "round": room.current_round,
                    "roundInfo": ROUND_INFO.get(room.current_round, "")
                }
            }
        )


# 全局游戏处理器实例
game_handler = GameHandler()