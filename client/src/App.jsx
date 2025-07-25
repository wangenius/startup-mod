import { useEffect, useRef, useState } from "react";
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';
import GameResult from './components/GameResult';
import RoleSelection from './components/RoleSelection';
import RoomManager from './components/RoomManager';
import WelcomePage from './components/WelcomePage';

// 游戏状态枚举
const GAME_STATES = {
  WELCOME: 'welcome',
  ROOM_SELECTION: 'room_selection',
  LOBBY: 'lobby',
  ROLE_SELECTION: 'role_selection',
  PLAYING: 'playing',
  RESULT: 'result'
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
  
  const [_, setMessages] = useState([]);

  const wsRef = useRef(null);

  // 检查房间状态并重连
  const reconnectToRoom = async (playerName, roomId) => {
    try {
      // 先检查房间是否存在
      const response = await fetch(`${API_BASE}/rooms/${roomId}/status`);
      if (response.ok) {
        addMessage(`房间 ${roomId} 存在，正在重连...`);
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(`房间 ${roomId} 不存在，清除保存的状态`, "error");
        clearSavedState();
        setGameState(GAME_STATES.WELCOME);
      }
    } catch (error) {
      addMessage(`检查房间状态失败: ${error.message}`, "error");
      clearSavedState();
      setGameState(GAME_STATES.WELCOME);
    }
  };

  // 从localStorage加载保存的状态
  useEffect(() => {
    const savedPlayerName = localStorage.getItem('startup_player_name');
    const savedRoomId = localStorage.getItem('startup_room_id');
    const savedGameState = localStorage.getItem('startup_game_state');
    
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
      
      if (savedRoomId && savedGameState) {
        setCurrentRoom(savedRoomId);
        setGameState(savedGameState);
        
        addMessage(`恢复会话: 玩家 ${savedPlayerName}, 房间 ${savedRoomId}`);
        
        // 延迟重连，确保其他函数已定义
        const reconnectTimer = setTimeout(() => {
          reconnectToRoom(savedPlayerName, savedRoomId);
        }, 1000);
        
        return () => clearTimeout(reconnectTimer);
      } else {
        // 只有玩家名称，跳转到房间选择页面
        setGameState(GAME_STATES.ROOM_SELECTION);
      }
    }
  }, []);

  // 保存状态到localStorage
  const saveGameState = (playerName, roomId, gameState) => {
    if (playerName) localStorage.setItem('startup_player_name', playerName);
    if (roomId) localStorage.setItem('startup_room_id', roomId);
    if (gameState) localStorage.setItem('startup_game_state', gameState);
  };

  // 清除保存的状态
  const clearSavedState = () => {
    localStorage.removeItem('startup_player_name');
    localStorage.removeItem('startup_room_id');
    localStorage.removeItem('startup_game_state');
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
        setGameState(GAME_STATES.LOBBY);
        saveGameState(playerName, roomId, GAME_STATES.LOBBY);
        addMessage(`🎮 成功连接并加入房间: ${roomId}`);
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
      case "player_join":
        addMessage(`🎮 ${message.data.player_name} 加入房间`);
        setPlayers(message.data.players);
        break;
      case "player_leave":
        addMessage(`👋 ${message.data.player_name} 离开房间`);
        setPlayers(message.data.players);
        break;
      case "game_start":
        setGameState(GAME_STATES.ROLE_SELECTION);
        saveGameState(null, null, GAME_STATES.ROLE_SELECTION);
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
        saveGameState(null, null, GAME_STATES.PLAYING);
        addMessage("🎯 所有角色已选择，游戏正式开始");
        break;
      case "round_start":
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
        addMessage(`第${message.data.round}轮结束`);
        break;
      case "game_complete":
        setGameState(GAME_STATES.RESULT);
        setGameResult(message.data.result);
        saveGameState(null, null, GAME_STATES.RESULT);
        addMessage("🎉 游戏结束");
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
      addMessage(`正在${action === 'create' ? '创建' : '加入'}房间: ${apiUrl}`);
      
      let requestBody = {};
      if (action === 'create') {
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
      
      if (action === 'create') {
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
      addMessage(`${action === 'create' ? '创建' : '加入'}房间失败: ${error.message}`, "error");
    }
  };

  // 处理创业想法提交
  const handleStartupIdeaSubmit = (idea) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "startup_idea",
          data: { idea }
        })
      );
    }
  };

  // 处理开始游戏
  const handleStartGame = () => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "start_game"
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
          data: { role: roleId }
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
          data: action
        })
      );
    }
  };

  // 处理重新开始游戏
  const handleRestartGame = () => {
    setGameState(GAME_STATES.WELCOME);
    setCurrentRoom("");
    setPlayers([]);
    setCurrentRound(1);
    setRoundInfo("");
    setPlayerActions([]);
    setGameResult(null);
    setSelectedRoles([]);
    setWaitingForPlayers(false);
    setMessages([]);
    clearSavedState();
    if (wsRef.current) {
      wsRef.current.close();
    }
    setWsConnected(false);
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
        const currentPlayer = players.find(p => p.name === playerName);
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
      
      case GAME_STATES.ROLE_SELECTION:
        return (
          <RoleSelection 
            players={players}
            playerName={playerName}
            onRoleSelect={handleRoleSelect}
            selectedRoles={selectedRoles}
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
          <div>连接: {wsConnected ? '已连接' : '未连接'}</div>
          <div>房间: {currentRoom}</div>
          <div>轮次: {currentRound}/5</div>
        </div>
      )}
    </div>
  );
}

export default App;
