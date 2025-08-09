/**
 * 游戏状态枚举
 * 定义游戏的所有可能状态
 */
export const GAME_STATES = {
  /** 初始状态 */
  INITIAL: "initial",
  /** 欢迎页面 */
  WELCOME: "welcome",
  /** 房间选择 */
  ROOM_SELECTION: "room_selection",
  /** 大厅 */
  LOBBY: "lobby",
  /** 加载 */
  LOADING: "loading",
  /** 回合加载 */
  ROUND_LOADING: "round_loading",
  /** 角色选择 */
  ROLE_SELECTION: "role_selection",
  /** 事件生成 */
  EVENT_GENERATION: "event_generation",
  /** 游戏进行中 */
  PLAYING: "playing",
  /** 回合结果 */
  ROUND_RESULT: "round_result",
  /** 游戏结果 */
  RESULT: "result",
} as const;

/**
 * 游戏状态类型
 */
export type GameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];

/**
 * 服务器配置类型
 */
export interface ServerConfig {
  /** HTTP API基础URL */
  http: string;
  /** WebSocket基础URL */
  ws: string;
  /** 主机地址（可选） */
  host?: string;
  /** 端口号（可选） */
  port?: string;
}

/**
 * 玩家信息类型
 */
export interface Player {
  /** 玩家名称 */
  name: string;
  /** 玩家ID */
  id?: string;
  /** 是否在线 */
  online?: boolean;
  /** 选择的角色 */
  role?: string;
  /** 创业想法 */
  idea?: string;
  /** 是否为房主 */
  isHost?: boolean;
}

/**
 * 轮次事件类型
 */
export interface RoundEvent {
  /** 事件标题 */
  event_title: string;
  /** 事件描述 */
  event_description: string;
  /** 决策选项 */
  decision_options: Record<string, string>;
}

/**
 * 玩家行动类型
 */
export interface PlayerAction {
  /** 玩家名称 */
  playerName: string;
  /** 行动类型 */
  actionType: string;
  /** 行动内容 */
  action: string;
  /** 轮次编号 */
  round: number;
  /** 时间戳 */
  timestamp?: string;
}

/**
 * 游戏结果类型
 */
export interface GameResult {
  final_score: number;
  success_level: string;
  metrics: {
    user_growth: number;
    revenue: number;
    market_share: number;
    team_size: number;
  };
  achievements: string[];
  timeline: {
    round: number;
    event: string;
    impact: string;
  }[];
  final_report: string;
}

/**
 * 角色定义类型
 */
export interface RoleDefinition {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 角色技能 */
  abilities?: string[];
  /** 角色图标 */
  icon?: string;
}

/**
 * WebSocket消息类型
 */
export interface WebSocketMessage {
  /** 消息类型 */
  type: string;
  /** 消息数据 */
  data: Record<string, any>;
  /** 消息ID（可选） */
  id?: string;
  /** 时间戳（可选） */
  timestamp?: string;
}

/**
 * 房间状态类型
 */
export interface RoomStatus {
  /** 房间ID */
  roomId: string;
  /** 玩家数量 */
  player_count: number;
  /** 游戏状态 */
  game_state: string;
  /** 是否已满 */
  is_full?: boolean;
}

/**
 * 房间信息类型
 */
export interface RoomInfo {
  /** 房间ID */
  room_id: string;
  /** 当前玩家数 */
  player_count: number;
  /** 最大玩家数 */
  max_players: number;
  /** 游戏状态 */
  game_state: string;
  /** 创建时间 */
  created_at: string | null;
  /** 玩家列表 */
  players: Array<{
    name: string;
    is_host: boolean;
  }>;
}

/**
 * 房间列表响应类型
 */
export interface RoomListResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 房间列表 */
  rooms: RoomInfo[];
  /** 房间总数 */
  total_count: number;
}
