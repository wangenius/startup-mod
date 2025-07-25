# 游戏服务器

## 这是一个游戏服务器。

游戏是一个多人在线的AI+社交游戏。

## 4人游戏房间实现思路

### 1. 房间管理系统

#### 房间状态
- **WAITING**: 等待玩家加入（1-3人）
- **READY**: 房间已满4人，准备开始
- **PLAYING**: 游戏进行中
- **FINISHED**: 游戏结束

#### 房间数据结构
```python
class GameRoom:
    room_id: str          # 房间唯一ID
    players: List[Player] # 玩家列表（最多4人）
    status: RoomStatus    # 房间状态
    created_at: datetime  # 创建时间
    game_data: dict       # 游戏数据
    ai_agent: AIAgent     # AI代理
```

### 2. 玩家匹配机制

#### 快速匹配
- 玩家发起匹配请求
- 系统查找状态为WAITING的房间
- 如果找到，直接加入；否则创建新房间
- 房间满4人后自动开始游戏

#### 房间码匹配
- 玩家可以创建私人房间获得房间码
- 其他玩家通过房间码加入指定房间
- 支持好友邀请功能

### 3. 实时通信架构

#### WebSocket连接管理
```python
class ConnectionManager:
    active_connections: Dict[str, WebSocket]  # 玩家ID -> WebSocket连接
    room_connections: Dict[str, List[str]]    # 房间ID -> 玩家ID列表
    
    async def broadcast_to_room(room_id: str, message: dict)
    async def send_to_player(player_id: str, message: dict)
```

#### 消息类型
- **PLAYER_JOIN**: 玩家加入房间
- **PLAYER_LEAVE**: 玩家离开房间
- **GAME_START**: 游戏开始
- **GAME_ACTION**: 游戏操作
- **GAME_STATE**: 游戏状态更新
- **AI_RESPONSE**: AI响应
- **CHAT_MESSAGE**: 聊天消息

### 4. 游戏状态同步

#### 状态管理
- 每个房间维护独立的游戏状态
- 使用事件驱动模式处理游戏逻辑
- 状态变更实时广播给房间内所有玩家

#### 断线重连
- 玩家断线后保留30秒重连时间
- 重连后同步当前游戏状态
- 超时未重连则标记为离线

### 5. AI集成方案

#### AI角色设定
- 每个房间配置一个AI代理
- AI可以作为NPC参与游戏
- 支持多种AI人格和难度设置

#### AI交互
- 玩家可以与AI进行自然语言对话
- AI根据游戏情况提供建议或挑战
- AI行为影响游戏进程和社交体验

### 6. 数据持久化

#### 数据库设计
```sql
-- 房间表
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    status ENUM('waiting', 'ready', 'playing', 'finished'),
    created_at TIMESTAMP,
    game_data JSON
);

-- 玩家房间关系表
CREATE TABLE room_players (
    room_id VARCHAR(36),
    player_id VARCHAR(36),
    joined_at TIMESTAMP,
    position INT,  -- 玩家在房间中的位置(1-4)
    PRIMARY KEY (room_id, player_id)
);

-- 游戏记录表
CREATE TABLE game_records (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36),
    game_data JSON,
    result JSON,
    finished_at TIMESTAMP
);
```

### 7. API接口设计

#### REST API
- `POST /rooms` - 创建房间
- `POST /rooms/{room_id}/join` - 加入房间
- `DELETE /rooms/{room_id}/leave` - 离开房间
- `GET /rooms/{room_id}` - 获取房间信息
- `GET /rooms/search` - 搜索可用房间

#### WebSocket事件
- 连接建立后发送认证信息
- 订阅房间事件
- 处理游戏操作和聊天消息

### 8. 性能优化

#### 内存管理
- 使用Redis缓存活跃房间数据
- 定期清理已结束的房间
- 限制单服务器最大房间数量

#### 负载均衡
- 支持多服务器部署
- 使用一致性哈希分配房间
- 跨服务器房间迁移机制

### 9. 安全考虑

#### 防作弊
- 服务器端验证所有游戏操作
- 操作时间窗口限制
- 异常行为检测和封禁

#### 数据安全
- 玩家数据加密存储
- API接口鉴权
- 防止恶意连接和攻击

### 10. 监控和日志

#### 关键指标
- 在线玩家数量
- 房间创建/销毁速率
- 平均游戏时长
- 连接稳定性

#### 日志记录
- 玩家行为日志
- 游戏事件日志
- 错误和异常日志
- 性能监控日志

