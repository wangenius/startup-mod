import { useEffect, useRef, useState } from "react";
import { GAME_STATES } from "../const/const";
import { GameContext } from "./GameContextCore";

/**
 * 获取服务器配置
 * 根据当前环境（开发/生产）返回相应的服务器地址配置
 * @returns {Object} 包含http和ws地址的配置对象
 */
const getServerConfig = () => {
  // 判断是否为开发环境
  const isDev = import.meta.env.DEV;
  // 从环境变量获取主机地址
  const envHost = import.meta.env.VITE_SERVER_HOST;
  // 从环境变量获取端口，默认8000
  const envPort = import.meta.env.VITE_SERVER_PORT || "8000";

  if (isDev) {
    // 开发环境：如果设置了环境变量主机地址
    if (envHost) {
      return { host: envHost, port: envPort };
    }

    // 获取当前页面的主机名
    const currentHost = window.location.hostname;
    // 本地开发环境
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      return { http: `http://localhost:8000`, ws: `ws://localhost:8000` };
    }

    // 其他开发环境（如局域网IP）
    return {
      http: `http://${currentHost}:8000`,
      ws: `ws://${currentHost}:8000`,
    };
  }

  // 生产环境：使用相对路径
  return { http: `/api`, ws: `/api` };
};

// 解构获取服务器配置
const { http: API_BASE, ws: WS_BASE } = getServerConfig();

/**
 * 游戏上下文提供者组件
 * 管理整个游戏的状态和逻辑，为所有子组件提供游戏相关的数据和方法
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 */
export function GameProvider({ children }) {
  // ==================== 基础状态 ====================
  
  /** @type {string} 当前游戏状态 */
  const [gameState, setGameState] = useState(GAME_STATES.INITIAL);
  
  /** @type {string} 当前玩家名称 */
  const [playerName, setPlayerName] = useState("");
  
  /** @type {string} 当前房间ID */
  const [currentRoom, setCurrentRoom] = useState("");
  
  /** @type {Array} 房间内所有玩家列表 */
  const [players, setPlayers] = useState([]);
  
  /** @type {boolean} WebSocket连接状态 */
  const [wsConnected, setWsConnected] = useState(false);

  // ==================== 游戏相关状态 ====================
  
  /** @type {number} 当前游戏轮次 */
  const [currentRound, setCurrentRound] = useState(1);
  
  /** @type {Object|null} 当前轮次的事件信息 */
  const [roundEvent, setRoundEvent] = useState(null);
  
  /** @type {Object} 玩家私人消息，key为玩家名，value为消息内容 */
  const [privateMessages, setPrivateMessages] = useState({});
  
  /** @type {Array} 玩家行动列表，存储所有玩家的行动记录 */
  const [playerActions, setPlayerActions] = useState([]);
  
  /** @type {Object|null} 游戏结果数据 */
  const [gameResult, setGameResult] = useState(null);
  
  /** @type {Array} 已选择的角色列表 */
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  /** @type {boolean} 是否正在等待其他玩家 */
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  
  /** @type {string|null} 游戏背景故事 */
  const [gameBackground, setGameBackground] = useState(null);
  
  /** @type {Object|null} 角色定义数据 */
  const [roleDefinitions, setRoleDefinitions] = useState(null);

  // ==================== 内部状态 ====================
  
  /** @type {Array} 消息列表（当前未使用） */
  const [, setMessages] = useState([]);

  // ==================== 引用对象 ====================
  
  /** @type {React.RefObject} WebSocket连接引用 */
  const wsRef = useRef(null);
  
  /** @type {React.RefObject} 背景音乐引用 */
  const audioRef = useRef(null);

  // ==================== Effect钩子 ====================
  
  /**
   * 初始化背景音乐
   * 设置音频循环播放，处理自动播放策略限制
   */
  useEffect(() => {
    // 创建音频对象
    const audio = new Audio("/背景音效.mp3");
    audio.loop = true; // 循环播放
    audio.volume = 0.3; // 设置音量为30%
    audioRef.current = audio;

    /**
     * 尝试播放音频
     * 处理浏览器自动播放策略限制
     */
    const playAudio = async () => {
      try {
        // 直接尝试播放
        await audio.play();
      } catch {
        // 如果自动播放失败，等待用户交互
        const handleUserInteraction = async () => {
          try {
            await audio.play();
            // 播放成功后移除事件监听器
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
          } catch (error) {
            console.error("Failed to play audio:", error);
          }
        };
        // 监听用户交互事件
        document.addEventListener("click", handleUserInteraction);
        document.addEventListener("keydown", handleUserInteraction);
      }
    };

    playAudio();

    // 清理函数：组件卸载时停止音频播放
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ==================== 工具函数 ====================
  
  /**
   * 添加系统消息
   * @param {string} content - 消息内容
   * @param {string} type - 消息类型，默认为"system"
   */
  const addMessage = (content, type = "system") => {
    const newMessage = {
      id: Date.now(), // 使用时间戳作为唯一ID
      content,
      type,
      timestamp: new Date().toLocaleTimeString(), // 格式化时间戳
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  /**
   * 保存游戏状态到本地存储
   * @param {string} savedPlayerName - 玩家名称
   * @param {string} roomId - 房间ID
   * @param {string} savedGameState - 游戏状态
   */
  const saveGameState = (savedPlayerName, roomId, savedGameState) => {
    if (savedPlayerName)
      localStorage.setItem("startup_player_name", savedPlayerName);
    if (roomId) localStorage.setItem("startup_room_id", roomId);
    if (savedGameState)
      localStorage.setItem("startup_game_state", savedGameState);
  };

  /**
   * 清除本地存储的游戏状态
   */
  const clearSavedState = () => {
    localStorage.removeItem("startup_player_name");
    localStorage.removeItem("startup_room_id");
    localStorage.removeItem("startup_game_state");
  };

  // ==================== WebSocket消息处理 ====================
  
  /**
   * 处理WebSocket接收到的消息
   * 根据消息类型执行相应的状态更新和UI变化
   * @param {Object} message - WebSocket消息对象
   * @param {string} message.type - 消息类型
   * @param {Object} message.data - 消息数据
   */
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      // 玩家加入房间
      case "player_join": {
        setPlayers(message.data.players);
        // 只有当加入的不是当前玩家时才显示消息
        if (message.data.player_name !== playerName) {
          addMessage(`🎮 ${message.data.player_name} 加入房间`);
        }
        break;
      }
      // 玩家离开房间
      case "player_leave":
        addMessage(`👋 ${message.data.player_name} 离开房间`);
        setPlayers(message.data.players);
        break;
      // 所有创业想法提交完成
      case "ideas_complete":
        addMessage("💡 所有创业想法已提交完成，等待角色选择！");
        setPlayers(message.data.players);
        setGameState(GAME_STATES.ROLE_SELECTION);
        saveGameState(playerName, currentRoom, GAME_STATES.ROLE_SELECTION);
        break;
      // 游戏加载中
      case "game_loading":
        setGameState(GAME_STATES.LOADING);
        saveGameState(playerName, currentRoom, GAME_STATES.LOADING);
        addMessage("🔄 游戏正在加载中...");
        break;
      // 游戏开始，进入角色选择
      case "game_start": {
        setGameState(GAME_STATES.ROLE_SELECTION);
        saveGameState(playerName, currentRoom, GAME_STATES.ROLE_SELECTION);
        // 设置游戏背景故事
        if (message.data && message.data.background) {
          setGameBackground(message.data.background);
        }
        // 设置角色定义
        if (message.data && message.data.roles) {
          setRoleDefinitions(message.data.roles);
        }
        addMessage("🚀 游戏开始，请选择角色");
        break;
      }
      // 过渡动画阶段
      case "transition_animation":
        setGameState(GAME_STATES.EVENT_GENERATION);
        saveGameState(playerName, currentRoom, GAME_STATES.EVENT_GENERATION);
        if (message.data && message.data.background) {
          setGameBackground(message.data.background);
        }
        if (message.data && message.data.roles) {
          setRoleDefinitions(message.data.roles);
        }
        addMessage("🎬 进入过渡动画，准备开始游戏");
        break;
      // 有玩家选择了角色
      case "role_selected":
        setSelectedRoles(message.data.selectedRoles);
        setPlayers(message.data.players);
        break;
      // 所有角色选择完成
      case "roles_complete":
        addMessage("🎯 所有角色已选择，游戏即将自动开始");
        break;
      // 游戏正式开始
      case "game_started":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(1);
        // 设置轮次事件
        if (message.data.roundEvent) {
          setRoundEvent(message.data.roundEvent);
        }
        // 设置私人消息
        if (message.data.privateMessages) {
          setPrivateMessages(message.data.privateMessages);
        }
        saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
        addMessage("🎯 游戏正式开始");
        break;
      // 轮次加载中
      case "round_loading":
        setGameState(GAME_STATES.ROUND_LOADING);
        setCurrentRound(message.data.round);
        saveGameState(playerName, currentRoom, GAME_STATES.ROUND_LOADING);
        addMessage(`🔄 ${message.data.message}`);
        break;
      // 新轮次开始
      case "round_start":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(message.data.round);
        // 更新轮次事件
        if (message.data.roundEvent) {
          setRoundEvent(message.data.roundEvent);
        }
        // 更新私人消息
        if (message.data.privateMessages) {
          setPrivateMessages(message.data.privateMessages);
        }
        // 重置玩家行动和等待状态
        setPlayerActions([]);
        setWaitingForPlayers(false);
        break;
      // 玩家提交行动
      case "action_submitted":
        setPlayerActions(message.data.playerActions);
        setWaitingForPlayers(message.data.waitingForPlayers);
        break;
      // 轮次结束
      case "round_complete":
        addMessage(`第${message.data.round}轮结束`);
        break;
      // 游戏结束
      case "game_complete":
        setGameState(GAME_STATES.RESULT);
        setGameResult(message.data.result);
        saveGameState(playerName, currentRoom, GAME_STATES.RESULT);
        addMessage("🎉 游戏结束");
        break;
      // 游戏重新开始
      case "game_restart":
        resetGameState();
        setPlayers(message.data.players);
        addMessage("🔄 房主重新开始了游戏");
        break;
      // 未知消息类型
      default:
        addMessage(`收到消息: ${JSON.stringify(message)}`);
    }
  };

  // ==================== WebSocket连接管理 ====================
  
  /**
   * 建立WebSocket连接
   * @param {string} player - 玩家名称
   * @param {string} roomId - 房间ID
   */
  const connectWebSocket = (player, roomId) => {
    // 参数验证
    if (!player || !roomId) {
      addMessage("请输入玩家名称和房间ID", "error");
      return;
    }

    // 关闭现有连接
    if (wsRef.current) {
      wsRef.current.close();
    }

    // 建立新连接
    const wsUrl = `${WS_BASE}/ws`;
    addMessage(`正在连接到: ${wsUrl}`);
    wsRef.current = new WebSocket(wsUrl);

    /**
     * WebSocket连接成功时的处理
     * 发送玩家信息进行房间验证
     */
    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({
          player_name: player,
          room_id: roomId,
        })
      );
    };

    /**
     * 处理WebSocket接收到的消息
     * @param {MessageEvent} event - WebSocket消息事件
     */
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // 处理连接成功消息
      if (message.type === "connection_success") {
        setWsConnected(true);
        setCurrentRoom(roomId);

        // 解构服务器返回的状态数据
        const {
          is_reconnect,        // 是否为重新连接
          game_state,          // 当前游戏状态
          current_round,       // 当前轮次
          players: playersData, // 玩家列表
          selected_roles,      // 已选择的角色
          player_actions,      // 玩家行动
          game_result,         // 游戏结果
          background,          // 游戏背景
          dynamic_roles: roles, // 动态角色定义
        } = message.data;

        setPlayers(playersData || []);

        // 处理重新连接的情况
        if (is_reconnect) {
          addMessage(`🔄 重新连接到房间: ${roomId}`);
          
          // 根据服务器状态恢复游戏状态
          switch (game_state) {
            case "lobby":
              setGameState(GAME_STATES.LOBBY);
              break;
            case "role_selection":
              setGameState(GAME_STATES.ROLE_SELECTION);
              if (selected_roles) setSelectedRoles(selected_roles);
              if (background) setGameBackground(background);
              if (roles) setRoleDefinitions(roles);
              break;
            case "loading":
              setGameState(GAME_STATES.ROUND_LOADING);
              setCurrentRound(current_round || 1);
              if (background) setGameBackground(background);
              break;
            case "playing":
              setGameState(GAME_STATES.PLAYING);
              setCurrentRound(current_round || 1);
              if (player_actions) setPlayerActions(player_actions);
              if (background) setGameBackground(background);
              if (message.data.roundEvent)
                setRoundEvent(message.data.roundEvent);
              if (message.data.privateMessages)
                setPrivateMessages(message.data.privateMessages);
              break;
            case "finished":
              setGameState(GAME_STATES.RESULT);
              if (game_result) setGameResult(game_result);
              break;
            default:
              setGameState(GAME_STATES.LOBBY);
          }

          // 映射服务器状态到客户端状态并保存
          const currentGameState =
            {
              lobby: GAME_STATES.LOBBY,
              role_selection: GAME_STATES.ROLE_SELECTION,
              loading: GAME_STATES.ROUND_LOADING,
              playing: GAME_STATES.PLAYING,
              finished: GAME_STATES.RESULT,
            }[game_state] || GAME_STATES.LOBBY;
          saveGameState(player, roomId, currentGameState);
        } else {
          // 新连接，进入大厅状态
          setGameState(GAME_STATES.LOBBY);
          saveGameState(player, roomId, GAME_STATES.LOBBY);
          addMessage(`🎮 成功加入房间: ${roomId}`);
        }
      } else {
        // 处理其他类型的消息
        handleWebSocketMessage(message);
      }
    };

    /**
     * WebSocket连接关闭时的处理
     * @param {CloseEvent} event - 关闭事件
     */
    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      // 根据关闭代码显示相应的错误信息
      if (event.code === 4004 || event.code === 4000 || event.code === 4001) {
        addMessage(`❌ ${event.reason}`, "error");
      } else {
        addMessage("WebSocket连接关闭");
      }
    };

    /**
     * WebSocket错误处理
     * @param {Event} error - 错误事件
     */
    wsRef.current.onerror = (error) => {
      addMessage(`WebSocket错误: ${error}`, "error");
      setWsConnected(false);
    };
  };

  /**
   * 重新连接到房间
   * 检查房间是否存在，如果存在则重新连接，否则返回房间选择页面
   * @param {string} player - 玩家名称
   * @param {string} roomId - 房间ID
   * @param {string} savedState - 保存的游戏状态
   */
  const reconnectToRoom = async (player, roomId, savedState) => {
    try {
      // 检查房间状态
      const response = await fetch(`${API_BASE}/rooms/${roomId}/status`);
      if (response.ok) {
        const roomStatus = await response.json();
        addMessage(`房间 ${roomId} 存在，玩家数: ${roomStatus.player_count}`);
        // 恢复游戏状态并重新连接
        setGameState(savedState);
        connectWebSocket(player, roomId);
      } else {
        // 房间不存在，清除保存状态
        addMessage(`房间 ${roomId} 不存在，返回房间选择页面`, "error");
        clearSavedState();
        setGameState(GAME_STATES.ROOM_SELECTION);
      }
    } catch (error) {
      // 网络错误或其他异常
      addMessage(
        `检查房间状态失败: ${error.message}，返回房间选择页面`,
        "error"
      );
      clearSavedState();
      setGameState(GAME_STATES.ROOM_SELECTION);
    }
  };

  /**
   * 从localStorage加载保存的游戏状态
   * 页面刷新或重新打开时恢复用户的游戏进度
   */
  useEffect(() => {
    const savedPlayerName = localStorage.getItem("startup_player_name");
    const savedRoomId = localStorage.getItem("startup_room_id");
    const savedGameState = localStorage.getItem("startup_game_state");

    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
      addMessage(`欢迎回来, ${savedPlayerName}!`);
      
      // 如果有保存的房间和游戏状态，尝试重新连接
      if (savedRoomId && savedGameState) {
        setCurrentRoom(savedRoomId);
        addMessage(`正在恢复房间状态: ${savedRoomId}`);
        // 延迟500ms后重新连接，确保组件完全初始化
        const reconnectTimer = setTimeout(() => {
          reconnectToRoom(savedPlayerName, savedRoomId, savedGameState);
        }, 500);
        return () => clearTimeout(reconnectTimer);
      } else {
        // 只有玩家名称，进入房间选择页面
        setGameState(GAME_STATES.ROOM_SELECTION);
        addMessage(`请选择或创建房间`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  /**
   * 保存玩家名称到本地存储
   * 当玩家名称发生变化时自动保存
   */
  useEffect(() => {
    if (playerName) {
      localStorage.setItem("startup_player_name", playerName);
    }
  }, [playerName]);

  // ==================== 事件处理函数 ====================
  
  /**
   * 处理首页点击事件
   * 从初始页面进入欢迎页面
   */
  const handleInitialPageClick = () => {
    setGameState(GAME_STATES.WELCOME);
  };

  /**
   * 处理玩家名称设置
   * @param {string} name - 玩家输入的名称
   */
  const handlePlayerNameSet = (name) => {
    setPlayerName(name);
    setGameState(GAME_STATES.ROOM_SELECTION);
    saveGameState(name, null, GAME_STATES.ROOM_SELECTION);
  };

  /**
   * 处理房间操作（创建或加入房间）
   * @param {string} _action - 操作类型（当前未使用）
   * @param {string} roomId - 房间ID
   */
  const handleRoomAction = async (_action, roomId) => {
    try {
      const apiUrl = `${API_BASE}/rooms/create`;
      addMessage(`正在进入房间: ${roomId}`);

      const requestBody = {
        room_id: roomId,
        player_name: playerName,
      };

      // 发送创建/加入房间的请求
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        addMessage(`成功进入房间 ${roomId}`);
        // 建立WebSocket连接
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(data.message || "进入房间失败", "error");
      }
    } catch (error) {
      addMessage(`进入房间失败: ${error.message}`, "error");
    }
  };

  /**
   * 处理创业想法提交
   * @param {string} idea - 玩家提交的创业想法
   */
  const handleStartupIdeaSubmit = (idea) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "startup_idea",
          data: { idea },
        })
      );
    }
  };

  /**
   * 处理角色选择
   * @param {string} roleId - 选择的角色ID
   */
  const handleRoleSelect = (roleId) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "select_role",
          data: { role: roleId },
        })
      );
    }
  };

  /**
   * 处理游戏行动提交
   * @param {Object} action - 玩家的行动数据
   */
  const handleActionSubmit = (action) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "game_action",
          data: action,
        })
      );
    }
  };

  /**
   * 处理事件生成完成
   * @param {Object} eventData - 事件数据
   * @param {number} eventData.round - 轮次编号
   */
  const handleEventGenerated = (eventData) => {
    addMessage(`第${eventData.round}轮事件已生成`);
  };

  /**
   * 处理开始轮次
   * 从加载状态切换到游戏中状态
   */
  const handleStartRound = () => {
    setGameState(GAME_STATES.PLAYING);
    saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
    addMessage(`第${currentRound}轮游戏开始`);
  };

  /**
   * 处理加载完成后开始游戏
   * 设置初始轮次并开始游戏
   */
  const handleLoadingComplete = () => {
    setGameState(GAME_STATES.PLAYING);
    setCurrentRound(1);
    saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
    addMessage(`🎯 游戏正式开始 - 第1轮`);
  };

  /**
   * 处理重新开始游戏
   * 如果有WebSocket连接则发送重启消息，否则本地重置
   */
  const handleRestartGame = () => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({ type: "restart_game" }));
    } else {
      resetGameState();
    }
  };

  /**
   * 重置游戏状态
   * 将所有游戏相关状态重置为初始值
   */
  const resetGameState = () => {
    setGameState(GAME_STATES.LOBBY);
    setCurrentRound(1);
    setRoundEvent(null);
    setPrivateMessages({});
    setPlayerActions([]);
    setGameResult(null);
    setSelectedRoles([]);
    setWaitingForPlayers(false);
    setGameBackground(null);
    setRoleDefinitions(null);
    saveGameState(playerName, currentRoom, GAME_STATES.LOBBY);
    addMessage("🔄 游戏已重新开始，回到等待室");
  };

  // ==================== Context值对象 ====================
  
  /**
   * 提供给子组件的Context值
   * 包含所有游戏状态和处理方法
   */
  const value = {
    // ========== 常量 ==========
    /** @type {Object} 游戏状态常量 */
    GAME_STATES,

    // ========== 状态数据 ==========
    /** @type {string} 当前游戏状态 */
    gameState,
    /** @type {string} 当前玩家名称 */
    playerName,
    /** @type {string} 当前房间ID */
    currentRoom,
    /** @type {Array} 房间内所有玩家列表 */
    players,
    /** @type {boolean} WebSocket连接状态 */
    wsConnected,
    /** @type {number} 当前游戏轮次 */
    currentRound,
    /** @type {Object|null} 当前轮次的事件信息 */
    roundEvent,
    /** @type {Object} 玩家私人消息 */
    privateMessages,
    /** @type {Array} 玩家行动列表 */
    playerActions,
    /** @type {Object|null} 游戏结果数据 */
    gameResult,
    /** @type {Array} 已选择的角色列表 */
    selectedRoles,
    /** @type {boolean} 是否正在等待其他玩家 */
    waitingForPlayers,
    /** @type {string|null} 游戏背景故事 */
    gameBackground,
    /** @type {Object|null} 角色定义数据 */
    roleDefinitions,

    // ========== 事件处理方法 ==========
    /** @type {Function} 处理首页点击事件 */
    handleInitialPageClick,
    /** @type {Function} 处理玩家名称设置 */
    handlePlayerNameSet,
    /** @type {Function} 处理房间操作 */
    handleRoomAction,
    /** @type {Function} 处理创业想法提交 */
    handleStartupIdeaSubmit,
    /** @type {Function} 处理角色选择 */
    handleRoleSelect,
    /** @type {Function} 处理游戏行动提交 */
    handleActionSubmit,
    /** @type {Function} 处理事件生成完成 */
    handleEventGenerated,
    /** @type {Function} 处理开始轮次 */
    handleStartRound,
    /** @type {Function} 处理加载完成后开始游戏 */
    handleLoadingComplete,
    /** @type {Function} 处理重新开始游戏 */
    handleRestartGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}