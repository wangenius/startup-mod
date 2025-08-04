/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import EventGeneration from "./components/EventGeneration";
import GameLoadingPage from "./components/GameLoadingPage";
import GameLobby from "./components/GameLobby";
import GamePlay from "./components/GamePlay";
import GameResult from "./components/GameResult";
import { InitialPage } from "./components/InitialPage";
import RoleSelection from "./components/RoleSelection";
import RoomManager from "./components/RoomManager";
import RoundLoadingPage from "./components/RoundLoadingPage";
import WelcomePage from "./components/WelcomePage";

// 游戏状态枚举
const GAME_STATES = {
  INITIAL: "initial",
  WELCOME: "welcome",
  ROOM_SELECTION: "room_selection",
  LOBBY: "lobby",
  LOADING: "loading",
  ROUND_LOADING: "round_loading",
  ROLE_SELECTION: "role_selection",
  EVENT_GENERATION: "event_generation",
  PLAYING: "playing",
  ROUND_RESULT: "round_result",
  RESULT: "result",
};

// 服务器配置
const getServerConfig = () => {
  const isDev = import.meta.env.DEV;
  const envHost = import.meta.env.VITE_SERVER_HOST;
  const envPort = import.meta.env.VITE_SERVER_PORT || "8000";

  if (isDev) {
    if (envHost) {
      return { host: envHost, port: envPort };
    }

    const currentHost = window.location.hostname;
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      return { http: `http://localhost:8000`, ws: `ws://localhost:8000` };
    }

    return {
      http: `http://${currentHost}:8000`,
      ws: `ws://${currentHost}:8000`,
    };
  }

  return { http: `/api`, ws: `/api` };
};

const { http: API_BASE, ws: WS_BASE } = getServerConfig();
console.log("服务器配置:", { API_BASE, WS_BASE });

function App() {
  // 基础状态
  const [gameState, setGameState] = useState(GAME_STATES.INITIAL);
  const [playerName, setPlayerName] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [players, setPlayers] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  // 游戏相关状态
  const [currentRound, setCurrentRound] = useState(1);
  const [roundEvent, setRoundEvent] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [playerActions, setPlayerActions] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [gameBackground, setGameBackground] = useState(null);
  const [roleDefinitions, setRoleDefinitions] = useState(null);

  const [_, setMessages] = useState([]);

  const wsRef = useRef(null);
  const audioRef = useRef(null);

  // 初始化背景音乐
  useEffect(() => {
    const audio = new Audio("/背景音效.mp3");
    audio.loop = true;
    audio.volume = 0.3; // 设置音量为30%
    audioRef.current = audio;

    // 尝试自动播放背景音乐
    const playAudio = async () => {
      try {
        await audio.play();
        console.log("背景音乐开始播放");
      } catch (error) {
        console.log("自动播放失败，需要用户交互后播放:", error);
        // 添加点击事件监听器，在用户首次交互时播放音乐
        const handleUserInteraction = async () => {
          try {
            await audio.play();
            console.log("用户交互后背景音乐开始播放");
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
          } catch (err) {
            console.log("播放失败:", err);
          }
        };
        document.addEventListener("click", handleUserInteraction);
        document.addEventListener("keydown", handleUserInteraction);
      }
    };

    playAudio();

    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 检查房间状态并重连
  const reconnectToRoom = async (playerName, roomId, savedGameState) => {
    try {
      // 先检查房间是否存在
      const response = await fetch(`${API_BASE}/rooms/${roomId}/status`);
      if (response.ok) {
        const roomStatus = await response.json();
        addMessage(`房间 ${roomId} 存在，玩家数: ${roomStatus.player_count}`);

        // 设置游戏状态为保存的状态
        setGameState(savedGameState);

        // 建立WebSocket连接
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(`房间 ${roomId} 不存在，返回房间选择页面`, "error");
        clearSavedState();
        setGameState(GAME_STATES.ROOM_SELECTION);
      }
    } catch (error) {
      addMessage(
        `检查房间状态失败: ${error.message}，返回房间选择页面`,
        "error"
      );
      clearSavedState();
      setGameState(GAME_STATES.ROOM_SELECTION);
    }
  };

  // 从localStorage加载保存的状态
  useEffect(() => {
    const savedPlayerName = localStorage.getItem("startup_player_name");
    const savedRoomId = localStorage.getItem("startup_room_id");
    const savedGameState = localStorage.getItem("startup_game_state");

    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
      addMessage(`欢迎回来, ${savedPlayerName}!`);

      if (savedRoomId && savedGameState) {
        // 用户之前在房间中，尝试恢复状态
        setCurrentRoom(savedRoomId);
        addMessage(`正在恢复房间状态: ${savedRoomId}`);

        // 延迟重连，确保其他函数已定义
        const reconnectTimer = setTimeout(() => {
          reconnectToRoom(savedPlayerName, savedRoomId, savedGameState);
        }, 500);

        return () => clearTimeout(reconnectTimer);
      } else {
        // 只有玩家名称，直接跳转到房间选择页面
        setGameState(GAME_STATES.ROOM_SELECTION);
        addMessage(`请选择或创建房间`);
      }
    }
  }, []);

  // 保存状态到localStorage
  const saveGameState = (playerName, roomId, gameState) => {
    if (playerName) localStorage.setItem("startup_player_name", playerName);
    if (roomId) localStorage.setItem("startup_room_id", roomId);
    if (gameState) localStorage.setItem("startup_game_state", gameState);
  };

  // 清除保存的状态
  const clearSavedState = () => {
    localStorage.removeItem("startup_player_name");
    localStorage.removeItem("startup_room_id");
    localStorage.removeItem("startup_game_state");
  };

  // 保存用户信息到本地存储
  useEffect(() => {
    if (playerName) {
      localStorage.setItem("startup_player_name", playerName);
    }
  }, [playerName]);

  const addMessage = (content, type = "system") => {
    const newMessage = {
      id: Date.now(),
      content,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const connectWebSocket = (playerName, roomId) => {
    if (!playerName || !roomId) {
      addMessage("请输入玩家名称和房间ID", "error");
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WS_BASE}/ws`;
    addMessage(`正在连接到: ${wsUrl}`);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({
          player_name: playerName,
          room_id: roomId,
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "connection_success") {
        setWsConnected(true);
        setCurrentRoom(roomId);

        console.log("连接成功", message.data);

        const {
          is_reconnect,
          game_state,
          current_round,
          players,
          selected_roles,
          player_actions,
          game_result,
          background,
          dynamic_roles: roles,
        } = message.data;

        // 更新玩家列表
        setPlayers(players || []);

        if (is_reconnect) {
          // 重连时恢复所有游戏状态
          addMessage(`🔄 重新连接到房间: ${roomId}`);

          // 根据服务器返回的游戏状态设置前端状态
          switch (game_state) {
            case "lobby":
              setGameState(GAME_STATES.LOBBY);
              break;
            case "role_selection":
              setGameState(GAME_STATES.ROLE_SELECTION);
              if (selected_roles) {
                setSelectedRoles(selected_roles);
              }
              if (background) {
                setGameBackground(background);
              }
              if (roles) {
                setRoleDefinitions(roles);
              }
              break;
            case "loading":
              setGameState(GAME_STATES.ROUND_LOADING);
              setCurrentRound(current_round || 1);

              if (background) {
                setGameBackground(background);
              }
              break;
            case "playing":
              setGameState(GAME_STATES.PLAYING);
              setCurrentRound(current_round || 1);

              if (player_actions) {
                setPlayerActions(player_actions);
              }
              if (background) {
                setGameBackground(background);
              }
              // 恢复轮次事件和私人信息
              if (message.data.roundEvent) {
                setRoundEvent(message.data.roundEvent);
              }
              if (message.data.privateMessages) {
                setPrivateMessages(message.data.privateMessages);
              }
              break;
            case "finished":
              setGameState(GAME_STATES.RESULT);
              if (game_result) {
                setGameResult(game_result);
              }
              break;
            default:
              setGameState(GAME_STATES.LOBBY);
          }

          // 保存恢复的状态
          const currentGameState =
            {
              lobby: GAME_STATES.LOBBY,
              role_selection: GAME_STATES.ROLE_SELECTION,
              loading: GAME_STATES.ROUND_LOADING,
              playing: GAME_STATES.PLAYING,
              finished: GAME_STATES.RESULT,
            }[game_state] || GAME_STATES.LOBBY;
          saveGameState(playerName, roomId, currentGameState);
        } else {
          // 新加入房间
          setGameState(GAME_STATES.LOBBY);
          saveGameState(playerName, roomId, GAME_STATES.LOBBY);
          addMessage(`🎮 成功加入房间: ${roomId}`);
        }
      } else {
        handleWebSocketMessage(message);
        console.log("收到消息", message);
      }
    };

    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      if (event.code === 4004 || event.code === 4000 || event.code === 4001) {
        addMessage(`❌ ${event.reason}`, "error");
      } else {
        addMessage("WebSocket连接关闭");
      }
    };

    wsRef.current.onerror = (error) => {
      addMessage(`WebSocket错误: ${error}`, "error");
      setWsConnected(false);
    };
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "player_join": {
        // 更新玩家列表，同时保持当前游戏状态
        setPlayers(message.data.players);

        // 如果是当前玩家重连，不显示加入消息
        if (message.data.player_name !== playerName) {
          addMessage(`🎮 ${message.data.player_name} 加入房间`);
        }
        break;
      }
      case "player_leave":
        addMessage(`👋 ${message.data.player_name} 离开房间`);
        setPlayers(message.data.players);
        break;
      case "ideas_complete":
        addMessage("💡 所有创业想法已提交完成，等待角色选择！");
        setPlayers(message.data.players);
        // 设置游戏状态为角色选择
        setGameState(GAME_STATES.ROLE_SELECTION);
        saveGameState(playerName, currentRoom, GAME_STATES.ROLE_SELECTION);
        break;
      case "game_loading":
        setGameState(GAME_STATES.LOADING);
        saveGameState(playerName, currentRoom, GAME_STATES.LOADING);
        addMessage("🔄 游戏正在加载中...");
        break;
      case "game_start":
        setGameState(GAME_STATES.ROLE_SELECTION);
        saveGameState(playerName, currentRoom, GAME_STATES.ROLE_SELECTION);
        if (message.data && message.data.background) {
          setGameBackground(message.data.background);
        }
        if (message.data && message.data.roles) {
          setRoleDefinitions(message.data.roles);
        }
        addMessage("🚀 游戏开始，请选择角色");
        break;
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
      case "role_selected":
        setSelectedRoles(message.data.selectedRoles);
        setPlayers(message.data.players);
        break;
      case "roles_complete":
        // 角色选择完成后会自动开始游戏，不再需要等待
        addMessage("🎯 所有角色已选择，游戏即将自动开始");
        break;
      case "game_started":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(1);
        if (message.data.roundEvent) {
          setRoundEvent(message.data.roundEvent);
        }
        if (message.data.privateMessages) {
          setPrivateMessages(message.data.privateMessages);
        }
        saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
        addMessage("🎯 游戏正式开始");
        break;
      case "round_loading":
        setGameState(GAME_STATES.ROUND_LOADING);
        setCurrentRound(message.data.round);
        saveGameState(playerName, currentRoom, GAME_STATES.ROUND_LOADING);
        addMessage(`🔄 ${message.data.message}`);
        break;
      case "round_start":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(message.data.round);
        if (message.data.roundEvent) {
          setRoundEvent(message.data.roundEvent);
        }
        if (message.data.privateMessages) {
          setPrivateMessages(message.data.privateMessages);
        }
        setPlayerActions([]);
        setWaitingForPlayers(false);
        break;
      case "action_submitted":
        setPlayerActions(message.data.playerActions);
        setWaitingForPlayers(message.data.waitingForPlayers);
        break;
      case "round_complete":
        // 轮次完成消息现在不再需要处理，因为后端会直接进入下一轮
        addMessage(`第${message.data.round}轮结束`);
        break;
      case "game_complete":
        setGameState(GAME_STATES.RESULT);
        setGameResult(message.data.result);
        saveGameState(playerName, currentRoom, GAME_STATES.RESULT);
        addMessage("🎉 游戏结束");
        break;
      case "game_restart":
        // 处理游戏重新开始消息
        resetGameState();
        setPlayers(message.data.players);
        addMessage("🔄 房主重新开始了游戏");
        break;
      default:
        addMessage(`收到消息: ${JSON.stringify(message)}`);
    }
  };

  // 处理InitialPage点击
  const handleInitialPageClick = () => {
    setGameState(GAME_STATES.WELCOME);
  };

  // 处理玩家名称设置
  const handlePlayerNameSet = (name) => {
    setPlayerName(name);
    setGameState(GAME_STATES.ROOM_SELECTION);
    saveGameState(name, null, GAME_STATES.ROOM_SELECTION);
  };

  // 处理房间操作
  const handleRoomAction = async (action, roomId) => {
    try {
      const apiUrl = `${API_BASE}/rooms/create`;
      addMessage(`正在进入房间: ${roomId}`);

      const requestBody = {
        room_id: roomId,
        player_name: playerName,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        addMessage(`成功进入房间 ${roomId}`);
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(data.message || "进入房间失败", "error");
      }
    } catch (error) {
      addMessage(`进入房间失败: ${error.message}`, "error");
    }
  };

  // 处理创业想法提交
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

  // 处理角色选择
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

  // handleStartGame函数已移除，因为角色选择完成后会自动开始游戏

  // 处理游戏行动提交
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

  // 处理事件生成完成
  const handleEventGenerated = (eventData) => {
    addMessage(`第${eventData.round}轮事件已生成`);
    // 可以在这里保存事件数据或进行其他处理
  };

  // 处理开始轮次
  const handleStartRound = () => {
    setGameState(GAME_STATES.PLAYING);
    saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
    addMessage(`第${currentRound}轮游戏开始`);
  };

  // 处理加载完成后开始游戏
  const handleLoadingComplete = () => {
    setGameState(GAME_STATES.PLAYING);
    setCurrentRound(1);
    saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
    addMessage(`🎯 游戏正式开始 - 第1轮`);
  };

  // 处理继续下一轮 - 已移除，因为后端现在自动进入下一轮

  // 处理重新开始游戏
  const handleRestartGame = () => {
    if (wsRef.current && wsConnected) {
      // 发送重新开始游戏的消息到服务器
      wsRef.current.send(
        JSON.stringify({
          type: "restart_game",
        })
      );
    } else {
      // 如果没有连接，直接在客户端重置状态
      resetGameState();
    }
  };

  // 重置游戏状态的辅助函数
  const resetGameState = () => {
    // 回到游戏等待室，而不是完全退出
    setGameState(GAME_STATES.LOBBY);
    // 保持房间连接，只重置游戏状态
    setCurrentRound(1);
    setRoundEvent(null);
    setPrivateMessages({});
    setPlayerActions([]);
    setGameResult(null);
    setSelectedRoles([]);
    setWaitingForPlayers(false);
    setGameBackground(null);
    setRoleDefinitions(null);

    // 保存新的游戏状态
    saveGameState(playerName, currentRoom, GAME_STATES.LOBBY);

    // 添加重新开始的消息
    addMessage("🔄 游戏已重新开始，回到等待室");
  };

  // 根据游戏状态渲染不同组件
  const renderCurrentState = () => {
    switch (gameState) {
      case GAME_STATES.INITIAL:
        return <InitialPage onClick={handleInitialPageClick} />;

      case GAME_STATES.WELCOME:
        return <WelcomePage onPlayerNameSet={handlePlayerNameSet} />;

      case GAME_STATES.ROOM_SELECTION:
        return (
          <RoomManager
            playerName={playerName}
            onRoomAction={handleRoomAction}
          />
        );

      case GAME_STATES.LOBBY: {
        const currentPlayer = players.find((p) => p.name === playerName);
        const isHost = currentPlayer?.isHost || false;
        return (
          <GameLobby
            roomId={currentRoom}
            players={players}
            playerName={playerName}
            onStartupIdeaSubmit={handleStartupIdeaSubmit}
            isHost={isHost}
          />
        );
      }

      case GAME_STATES.ROLE_SELECTION: {
        return (
          <RoleSelection
            players={players}
            playerName={playerName}
            onRoleSelect={handleRoleSelect}
            selectedRoles={selectedRoles}
            gameBackground={gameBackground}
            roleDefinitions={roleDefinitions}
          />
        );
      }

      case GAME_STATES.LOADING:
        return (
          <GameLoadingPage
            playerName={playerName}
            gameBackground={gameBackground}
            roleDefinitions={roleDefinitions}
            onLoadingComplete={handleLoadingComplete}
          />
        );

      case GAME_STATES.ROUND_LOADING:
        return (
          <RoundLoadingPage
            roomId={currentRoom}
            playerName={playerName}
            currentRound={currentRound}
            loadingMessage={null}
          />
        );

      case GAME_STATES.EVENT_GENERATION:
        return (
          <EventGeneration
            playerName={playerName}
            currentRound={currentRound}
            onEventGenerated={handleEventGenerated}
            onStartRound={handleStartRound}
          />
        );

      case GAME_STATES.PLAYING:
        return (
          <GamePlay
            gameState={{ players }}
            playerName={playerName}
            currentRound={currentRound}
            roundEvent={roundEvent}
            privateMessages={privateMessages}
            onActionSubmit={handleActionSubmit}
            waitingForPlayers={waitingForPlayers}
            playerActions={playerActions}
          />
        );

      case GAME_STATES.ROUND_RESULT:
        // RoundResult页面已移除，因为现在直接进入下一轮
        return null;

      case GAME_STATES.RESULT:
        return (
          <GameResult
            gameResult={gameResult}
            players={players}
            onRestart={handleRestartGame}
          />
        );

      default:
        return <WelcomePage onPlayerNameSet={handlePlayerNameSet} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto">
        {renderCurrentState()}
      </div>
    </div>
  );
}

export default App;
