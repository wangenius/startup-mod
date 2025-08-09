import { createContext, useContext } from "react";
import type { 
  GameState, 
  Player, 
  RoundEvent, 
  PlayerAction, 
  GameResult, 
  RoleDefinition,
  RoomInfo 
} from "../const/const";

/**
 * 游戏上下文类型定义
 */
export interface GameContextType {
  // ========== 常量 ==========
  /** 游戏状态常量 */
  GAME_STATES: typeof import("../const/const").GAME_STATES;

  // ========== 状态数据 ==========
  /** 当前游戏状态 */
  gameState: GameState;
  /** 当前玩家名称 */
  playerName: string;
  /** 当前房间ID */
  currentRoom: string;
  /** 房间内所有玩家列表 */
  players: Player[];
  /** WebSocket连接状态 */
  wsConnected: boolean;
  /** 当前游戏轮次 */
  currentRound: number;
  /** 当前轮次的事件信息 */
  roundEvent: RoundEvent | null;
  /** 玩家私人消息 */
  privateMessages: Record<string, string>;
  /** 玩家行动列表 */
  playerActions: PlayerAction[];
  /** 游戏结果数据 */
  gameResult: GameResult | null;
  /** 已选择的角色列表 */
  selectedRoles: string[];
  /** 是否正在等待其他玩家 */
  waitingForPlayers: boolean;
  /** 游戏背景故事 */
  gameBackground: string | null;
  /** 角色定义数据 */
  roleDefinitions: Record<string, RoleDefinition> | null;
  /** 房间列表数据 */
  roomList: RoomInfo[];
  /** 是否正在加载房间列表 */
  loadingRoomList: boolean;

  // ========== 事件处理方法 ==========
  /** 处理首页点击事件 */
  handleInitialPageClick: () => void;
  /** 处理玩家名称设置 */
  handlePlayerNameSet: (name: string) => void;
  /** 处理房间操作 */
  handleRoomAction: (action: string, roomId: string) => Promise<void>;
  /** 处理创业想法提交 */
  handleStartupIdeaSubmit: (idea: string) => void;
  /** 处理角色选择 */
  handleRoleSelect: (roleId: string) => void;
  /** 处理游戏行动提交 */
  handleActionSubmit: (action: PlayerAction) => void;
  /** 处理事件生成完成 */
  handleEventGenerated: (eventData: { round: number }) => void;
  /** 处理开始轮次 */
  handleStartRound: () => void;
  /** 处理加载完成后开始游戏 */
  handleLoadingComplete: () => void;
  /** 处理重新开始游戏 */
  handleRestartGame: () => void;
  /** 处理退出房间 */
  handleExitRoom: () => void;
  /** 获取房间列表 */
  fetchRoomList: () => Promise<void>;
}

/**
 * 创建游戏上下文
 */
export const GameContext = createContext<GameContextType | null>(null);

/**
 * 使用游戏上下文的Hook
 * @returns 游戏上下文对象
 * @throws 如果在GameProvider外使用则抛出错误
 */
export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame 必须在 GameProvider 内使用");
  }
  return ctx;
}
