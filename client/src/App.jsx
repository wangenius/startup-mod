/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import GameLobby from "./components/GameLobby";
import GamePlay from "./components/GamePlay";
import GameResult from "./components/GameResult";
import LoadingPage from "./components/LoadingPage";
import RoleSelection from "./components/RoleSelection";
import RoomManager from "./components/RoomManager";
import RoundResult from "./components/RoundResult";
import WelcomePage from "./components/WelcomePage";

// 游戏状态枚举
const GAME_STATES = {
  WELCOME: "welcome",
  ROOM_SELECTION: "room_selection",
  LOBBY: "lobby",
  LOADING: "loading",
  ROLE_SELECTION: "role_selection",
  PLAYING: "playing",
  ROUND_RESULT: "round_result",
  RESULT: "result",
};

// 服务器配置
const getServerConfig = () => {
  const envHost = import.meta.env.VITE_SERVER_HOST;
  const envPort = import.meta.env.VITE_SERVER_PORT || "8000";

  if (envHost) {
    return { host: envHost, port: envPort };
  }

  const currentHost = window.location.hostname;
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return { host: "localhost", port: "8000" };
  }
  return { host: currentHost, port: "8000" };
};

const { host: SERVER_HOST, port: SERVER_PORT } = getServerConfig();
const API_BASE = `http://${SERVER_HOST}:${SERVER_PORT}`;
const WS_BASE = `ws://${SERVER_HOST}:${SERVER_PORT}`;

console.log("服务器配置:", { API_BASE, WS_BASE });

function App() {
  // 基础状态
  const [gameState, setGameState] = useState(GAME_STATES.WELCOME);
  const [playerName, setPlayerName] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [players, setPlayers] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  // 游戏相关状态
  const [currentRound, setCurrentRound] = useState(1);
  const [roundInfo, setRoundInfo] = useState("");
  const [playerActions, setPlayerActions] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [completedRound, setCompletedRound] = useState(null);
  const [completedRoundActions, setCompletedRoundActions] = useState([]);
  const [gameBackground, setGameBackground] = useState(null);
  const [roleDefinitions, setRoleDefinitions] = useState(null);

  const [_, setMessages] = useState([]);

  const wsRef = useRef(null);

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

        const {
          is_reconnect,
          game_state,
          current_round,
          players,
          selected_roles,
          round_info,
          player_actions,
          game_result,
          background,
          roles,
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
            case "playing":
              setGameState(GAME_STATES.PLAYING);
              setCurrentRound(current_round || 1);
              if (round_info) {
                setRoundInfo(round_info);
              }
              if (player_actions) {
                setPlayerActions(player_actions);
              }
              if (background) {
                setGameBackground(background);
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
        addMessage("💡 所有创业想法已提交完成，可以开始游戏了！");
        setPlayers(message.data.players);
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
      case "role_selected":
        setSelectedRoles(message.data.selectedRoles);
        setPlayers(message.data.players);
        break;
      case "roles_complete":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(1);
        setRoundInfo(message.data.roundInfo);
        saveGameState(playerName, currentRoom, GAME_STATES.PLAYING);
        addMessage("🎯 所有角色已选择，游戏正式开始");
        break;
      case "round_start":
        setGameState(GAME_STATES.PLAYING);
        setCurrentRound(message.data.round);
        setRoundInfo(message.data.roundInfo);
        setPlayerActions([]);
        setWaitingForPlayers(false);
        break;
      case "action_submitted":
        setPlayerActions(message.data.playerActions);
        setWaitingForPlayers(message.data.waitingForPlayers);
        break;
      case "round_complete":
        setCompletedRound(message.data.round);
        setCompletedRoundActions(playerActions);
        setGameState(GAME_STATES.ROUND_RESULT);
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

  // 处理玩家名称设置
  const handlePlayerNameSet = (name) => {
    setPlayerName(name);
    setGameState(GAME_STATES.ROOM_SELECTION);
    saveGameState(name, null, GAME_STATES.ROOM_SELECTION);
  };

  // 处理房间操作
  const handleRoomAction = async (action, roomId) => {
    try {
      const apiUrl = `${API_BASE}/rooms/${action}`;
      addMessage(`正在${action === "create" ? "创建" : "加入"}房间: ${apiUrl}`);

      let requestBody = {};
      if (action === "create") {
        // 创建房间不需要参数
        requestBody = {};
      } else {
        // 加入房间需要房间ID和玩家名称
        requestBody = {
          room_id: roomId,
          player_name: playerName,
        };
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (action === "create") {
        if (data.room_id) {
          addMessage(`房间 ${data.room_id} 创建成功`);
          connectWebSocket(playerName, data.room_id);
        } else {
          addMessage("创建房间失败", "error");
        }
      } else {
        if (data.success) {
          addMessage(`房间 ${roomId} 加入成功`);
          connectWebSocket(playerName, roomId);
        } else {
          addMessage(data.message || "加入房间失败", "error");
        }
      }
    } catch (error) {
      addMessage(
        `${action === "create" ? "创建" : "加入"}房间失败: ${error.message}`,
        "error"
      );
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

  // 处理开始游戏
  const handleStartGame = () => {
    if (wsRef.current && wsConnected) {
      setGameState(GAME_STATES.LOADING);
      saveGameState(playerName, currentRoom, GAME_STATES.LOADING);
      wsRef.current.send(
        JSON.stringify({
          type: "start_game",
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

  // 处理继续下一轮
  const handleContinueToNextRound = () => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "continue_next_round",
        })
      );
    }
    // 重置轮次结果状态
    setCompletedRound(null);
    setCompletedRoundActions([]);
  };

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
    setRoundInfo("");
    setPlayerActions([]);
    setGameResult(null);
    setSelectedRoles([]);
    setWaitingForPlayers(false);
    setCompletedRound(null);
    setCompletedRoundActions([]);
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
            onStartGame={handleStartGame}
            isHost={isHost}
          />
        );
      }

      case GAME_STATES.LOADING:
        return (
          <LoadingPage
            roomId={currentRoom}
            playerName={playerName}
          />
        );

      case GAME_STATES.ROLE_SELECTION:
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

      case GAME_STATES.PLAYING:
        return (
          <GamePlay
            gameState={{ players }}
            playerName={playerName}
            currentRound={currentRound}
            roundInfo={roundInfo}
            onActionSubmit={handleActionSubmit}
            waitingForPlayers={waitingForPlayers}
            playerActions={playerActions}
          />
        );

      case GAME_STATES.ROUND_RESULT:
        return (
          <RoundResult
            roundNumber={completedRound}
            playerActions={completedRoundActions}
            players={players}
            playerName={playerName}
            onContinueToNextRound={handleContinueToNextRound}
          />
        );

      case GAME_STATES.RESULT:
        return (
          <GameResult
            gameResult={gameResult}
            players={players}
            onRestartGame={handleRestartGame}
          />
        );

      default:
        return <WelcomePage onPlayerNameSet={handlePlayerNameSet} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentState()}

      {/* 调试信息 */}
      {import.meta.env?.DEV && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
          <div>状态: {gameState}</div>
          <div>连接: {wsConnected ? "已连接" : "未连接"}</div>
          <div>房间: {currentRoom}</div>
          <div>轮次: {currentRound}/5</div>
          <button onClick={handleRestartGame}>重新开始</button>
        </div>
      )}
    </div>
  );
}

export default App;
