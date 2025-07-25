from typing import Dict, Optional
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 玩家ID -> WebSocket连接
        self.active_connections: Dict[str, WebSocket] = {}
        # 玩家ID -> 房间ID
        self.player_rooms: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        """建立WebSocket连接"""
        self.active_connections[player_id] = websocket
        logger.info(f"玩家 {player_id} 已连接")

    def disconnect(self, player_id: str):
        """断开WebSocket连接"""
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        logger.info(f"玩家 {player_id} 已断开连接")

    def join_room(self, player_id: str, room_id: str):
        """玩家加入房间"""
        self.player_rooms[player_id] = room_id

    def get_player_room(self, player_id: str) -> Optional[str]:
        """获取玩家所在房间ID"""
        return self.player_rooms.get(player_id)

    async def send_to_player(self, player_id: str, message: dict):
        """发送消息给指定玩家"""
        if player_id in self.active_connections:
            try:
                await self.active_connections[player_id].send_text(
                    json.dumps(message, default=str)
                )
            except Exception as e:
                logger.error(f"发送消息给玩家 {player_id} 失败: {e}")
                self.disconnect(player_id)

    async def broadcast_to_room(
        self, room_id: str, message: dict, exclude_player: Optional[str] = None
    ):
        """向房间内所有玩家广播消息"""
        from room_manager import room_manager  # 避免循环导入
        
        room = room_manager.get_room(room_id)
        if room:
            for player in room.players:
                if player.is_online and player.name in self.active_connections:
                    if exclude_player and player.name == exclude_player:
                        continue
                    await self.send_to_player(player.name, message)

    def get_connected_players(self) -> list:
        """获取所有已连接的玩家列表"""
        return list(self.active_connections.keys())

    def is_player_connected(self, player_id: str) -> bool:
        """检查玩家是否已连接"""
        return player_id in self.active_connections


# 全局连接管理器实例
connection_manager = ConnectionManager()