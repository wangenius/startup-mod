from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import logging

from models import Player
from room_manager import room_manager
from websocket_handler import WebSocketHandler
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="创业模拟器 API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

websocket_handler = WebSocketHandler()


# API 端点
@app.get("/")
async def root():
    return {"message": "创业模拟器游戏服务器正在运行"}


@app.post("/rooms/create")
async def create_room():
    import uuid
    room_id = str(uuid.uuid4())[:8]
    try:
        room_manager.create_room(room_id)
        logger.info(f"Created room: {room_id}")
        return {"room_id": room_id}
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="创建房间失败")


from pydantic import BaseModel

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
        "game_state": room.game_state.value if room.game_state else "waiting"
    }

@app.post("/rooms/join")
async def join_room_endpoint(request: JoinRoomRequest):
    room = room_manager.get_room(request.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")
    
    player = Player(
        name=request.player_name,
        joined_at=datetime.now()
    )
    
    try:
        room = room_manager.join_room(request.player_name, request.room_id)
        logger.info(f"Player {request.player_name} joined room {request.room_id}")
        return {"success": True, "room_id": request.room_id, "player_name": request.player_name}
    except ValueError as e:
        logger.error(f"Error joining room: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error joining room: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")


@app.post("/api/generate-event")
async def generate_event(request: EventGenerationRequest):
    """生成游戏事件"""
    try:
        # 导入事件生成相关模块
        import os
        import sys
        import json
        
        # 添加script目录到Python路径
        script_dir = os.path.join(os.path.dirname(__file__), 'script')
        if script_dir not in sys.path:
            sys.path.append(script_dir)
        
        from script.step2_decision import DecisionMaker
        
        # 读取背景信息
        output_dir = os.path.join(script_dir, 'output')
        background_file = os.path.join(output_dir, 'background.json')
        
        if not os.path.exists(background_file):
            raise HTTPException(status_code=404, detail="游戏背景文件不存在，请先初始化游戏")
        
        with open(background_file, 'r', encoding='utf-8') as f:
            background_data = json.load(f)
        
        # 构建初始想法
        background_text = background_data.get('background', '')
        player_ideas = background_data.get('player_ideas', [])
        
        if player_ideas:
            initial_idea = f"创业想法：{' + '.join(player_ideas)}\n\n{background_text}"
        else:
            initial_idea = background_text
        
        # 创建决策制定器
        decision_maker = DecisionMaker(initial_idea)
        
        # 如果不是第一轮，加载之前的输出
        if request.round > 1:
            previous_round_file = os.path.join(output_dir, f'round_{request.round-1}.json')
            if os.path.exists(previous_round_file):
                with open(previous_round_file, 'r', encoding='utf-8') as f:
                    decision_maker.previous_output = json.load(f)
        
        # 生成事件
        event = decision_maker.generate_event(request.round)
        
        logger.info(f"Generated event for round {request.round} by player {request.player_name}")
        
        return {
            "success": True,
            "round": request.round,
            "event": event,
            "generated_by": request.player_name,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating event: {e}")
        raise HTTPException(status_code=500, detail=f"生成事件失败: {str(e)}")


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
