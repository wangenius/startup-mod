from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import logging

from room_manager import room_manager
from websocket_handler import WebSocketHandler

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="创业模拟器 API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

websocket_handler = WebSocketHandler()


# API 端点
@app.get("/")
async def root():
    return {"message": "创业模拟器游戏服务器正在运行"}


from pydantic import BaseModel


class CreateRoomRequest(BaseModel):
    room_id: str
    player_name: str


@app.post("/rooms/create")
async def create_room(request: CreateRoomRequest):
    try:
        # 检查房间是否已存在
        existing_room = room_manager.get_room(request.room_id)
        if existing_room:
            # 房间已存在，直接加入
            room = room_manager.join_room(request.player_name, request.room_id)
            logger.info(
                f"Player {request.player_name} joined existing room: {request.room_id}"
            )
        else:
            # 房间不存在，创建新房间
            room = room_manager.create_room(request.room_id)
            # 创建者自动加入房间
            room = room_manager.join_room(request.player_name, request.room_id)
            logger.info(
                f"Created room: {request.room_id} and added player: {request.player_name}"
            )

        return {"room_id": request.room_id, "success": True}
    except Exception as e:
        logger.error(f"Error creating/joining room: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class JoinRoomRequest(BaseModel):
    room_id: str
    player_name: str


class EventGenerationRequest(BaseModel):
    round: int
    player_name: str


@app.get("/rooms/{room_id}/status")
async def get_room_status(room_id: str):
    """检查房间状态"""
    room = room_manager.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")

    return {
        "exists": True,
        "room_id": room_id,
        "player_count": len(room.get_online_players()),
        "game_state": room.game_state.value if room.game_state else "waiting",
    }


# WebSocket 端点
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket_handler.handle_connection(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
