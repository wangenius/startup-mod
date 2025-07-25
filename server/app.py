from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import json
import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="游戏服务器", description="多人在线游戏服务器")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 枚举定义
class MessageType(str, Enum):
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    GAME_ACTION = "game_action"
    CHAT_MESSAGE = "chat_message"
    RECONNECT = "reconnect"


# 数据模型
class Player(BaseModel):
    name: str
    is_online: bool = True
    joined_at: datetime


class GameRoom(BaseModel):
    room_id: str
    players: List[Player] = []
    created_at: datetime
    game_data: Dict = {}

    def add_player(self, player: Player) -> bool:
        # 检查玩家是否已存在
        existing_player = self.get_player(player.name)
        if existing_player:
            existing_player.is_online = True
            return True

        self.players.append(player)
        return True

    def remove_player(self, player_name: str) -> bool:
        player = self.get_player(player_name)
        if player:
            player.is_online = False
        return True

    def get_player(self, player_name: str) -> Optional[Player]:
        for player in self.players:
            if player.name == player_name:
                return player
        return None


class Message(BaseModel):
    type: MessageType
    room_id: str
    player_id: Optional[str] = None
    data: Dict = {}
    timestamp: datetime = datetime.now()


# WebSocket连接管理器
class ConnectionManager:
    def __init__(self):
        # 玩家ID -> WebSocket连接
        self.active_connections: Dict[str, WebSocket] = {}
        # 玩家ID -> 房间ID
        self.player_rooms: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        self.active_connections[player_id] = websocket
        logger.info(f"玩家 {player_id} 已连接")

    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]

        logger.info(f"玩家 {player_id} 已断开连接")

    def join_room(self, player_id: str, room_id: str):
        self.player_rooms[player_id] = room_id

    def get_player_room(self, player_id: str) -> Optional[str]:
        return self.player_rooms.get(player_id)

    async def send_to_player(self, player_id: str, message: dict):
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
        room = room_manager.get_room(room_id)
        if room:
            for player in room.players:
                if player.is_online and player.name in self.active_connections:
                    if exclude_player and player.name == exclude_player:
                        continue
                    await self.send_to_player(player.name, message)


# 房间管理器
class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, GameRoom] = {}

    def create_room(self, room_id: str) -> GameRoom:
        """创建房间"""
        if room_id in self.rooms:
            raise ValueError(f"房间 {room_id} 已存在")

        room = GameRoom(room_id=room_id, created_at=datetime.now())
        self.rooms[room_id] = room
        logger.info(f"房间 {room_id} 已创建")
        return room

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self.rooms.get(room_id)

    def get_all_rooms(self) -> Dict[str, GameRoom]:
        return self.rooms

    def join_room(self, player_name: str, room_id: str) -> GameRoom:
        room = self.get_room(room_id)
        if not room:
            raise ValueError(f"房间 {room_id} 不存在")

        player = Player(name=player_name, joined_at=datetime.now())

        room.add_player(player)
        logger.info(f"玩家 {player_name} 加入房间 {room_id}")
        return room

    def leave_room(self, room_id: str, player_name: str) -> bool:
        room = self.get_room(room_id)
        if not room:
            return False

        return room.remove_player(player_name)

    def find_player_room(self, player_name: str) -> Optional[str]:
        """查找玩家所在的房间"""
        for room_id, room in self.rooms.items():
            if room.get_player(player_name):
                return room_id
        return None


# 全局实例
connection_manager = ConnectionManager()
room_manager = RoomManager()


# API路由
@app.get("/")
async def root():
    return {"message": "游戏服务器运行中", "rooms": len(room_manager.rooms)}


@app.get("/rooms")
async def get_all_rooms():
    """获取所有房间列表"""
    rooms = room_manager.get_all_rooms()
    return {
        "success": True,
        "rooms": [
            {
                "room_id": room_id,
                "player_count": len(room.players),
                "created_at": room.created_at.isoformat(),
            }
            for room_id, room in rooms.items()
        ],
    }


@app.post("/rooms/create")
async def create_room(request: dict):
    """创建房间"""
    try:
        room_id = request.get("room_id")
        if not room_id:
            return {"success": False, "message": "房间ID不能为空"}
        
        room = room_manager.create_room(room_id)
        return {
            "success": True,
            "message": f"房间 {room_id} 创建成功",
            "room_id": room_id,
        }
    except ValueError as e:
        return {"success": False, "message": str(e)}


@app.post("/rooms/join")
async def join_room_api(request: dict):
    """加入房间"""
    try:
        room_id = request.get("room_id")
        player_name = request.get("player_name")
        
        if not room_id or not player_name:
            return {"success": False, "message": "房间ID和玩家名称不能为空"}
        
        room = room_manager.join_room(player_name, room_id)
        return {
            "success": True,
            "message": f"玩家 {player_name} 成功加入房间 {room_id}",
            "room_id": room_id,
            "players": [
                {"name": p.name, "is_online": p.is_online} for p in room.players
            ],
        }
    except ValueError as e:
        return {"success": False, "message": str(e)}


@app.get("/player/{player_name}/room")
async def get_player_room(player_name: str):
    """获取玩家所在房间"""
    room_id = room_manager.find_player_room(player_name)
    if room_id:
        room = room_manager.get_room(room_id)
        if room:
            return {
                "success": True,
                "room_id": room_id,
                "players": [
                    {"name": p.name, "is_online": p.is_online} for p in room.players
                ],
            }
    return {"success": False, "message": "玩家不在任何房间中"}


# WebSocket端点
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
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
        
        # 连接管理器
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
        else:
            # 玩家已在房间中，设置为在线状态
            player.is_online = True
            
        connection_manager.join_room(player_name, room.room_id)

        # 广播玩家加入
        await connection_manager.broadcast_to_room(
            room.room_id,
            {
                "type": MessageType.PLAYER_JOIN,
                "data": {
                    "player_name": player_name,
                    "players": [
                        {"name": p.name, "is_online": p.is_online} for p in room.players
                    ],
                },
            },
        )
        
        # 发送连接成功消息
        await websocket.send_text(json.dumps({
            "type": "connection_success",
            "data": {
                "room_id": room_id,
                "player_name": player_name
            }
        }))
        
    except ValueError as e:
        # 房间不存在，关闭连接
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
            await handle_websocket_message(player_name, message_data)

    except WebSocketDisconnect:
        connection_manager.disconnect(player_name)

        # 处理玩家离线
        room_id = connection_manager.get_player_room(player_name) or ""
        if room_id:
            room_manager.leave_room(room_id, player_name)

            # 广播玩家离线
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.PLAYER_LEAVE,
                    "data": {"player_name": player_name},
                },
            )


async def handle_websocket_message(player_name: str, message_data: dict):
    """处理WebSocket消息"""
    try:
        message_type = message_data.get("type")
        data = message_data.get("data", {})

        # 获取玩家所在房间
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player:
            return

        if message_type == "chat_message":
            # 聊天消息
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.CHAT_MESSAGE,
                    "data": {
                        "player_name": player.name,
                        "message": data.get("message", ""),
                        "timestamp": datetime.now().isoformat(),
                    },
                },
            )

        elif message_type == "game_action":
            # 游戏操作
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_ACTION,
                    "data": {
                        "player_name": player.name,
                        "action": data.get("action"),
                        "params": data.get("params", {}),
                    },
                },
                exclude_player=player_name,
            )

    except Exception as e:
        logger.error(f"处理WebSocket消息失败: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
