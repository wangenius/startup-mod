import { useState, useEffect, useRef } from "react";

// 服务器配置 - 支持其他电脑访问
// 可以通过环境变量或手动修改来配置服务器地址
const getServerConfig = () => {
  // 优先使用环境变量
  const envHost = import.meta.env.VITE_SERVER_HOST;
  const envPort = import.meta.env.VITE_SERVER_PORT || "8000";

  if (envHost) {
    return { host: envHost, port: envPort };
  }

  // 如果没有环境变量，根据当前环境判断
  const currentHost = window.location.hostname;

  // 如果是localhost访问，默认使用localhost
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return { host: "localhost", port: "8000" };
  }

  // 如果是其他地址访问，假设后端在同一台机器
  return { host: currentHost, port: "8000" };
};

const { host: SERVER_HOST, port: SERVER_PORT } = getServerConfig();
const API_BASE = `http://${SERVER_HOST}:${SERVER_PORT}`;
const WS_BASE = `ws://${SERVER_HOST}:${SERVER_PORT}`;

// 在控制台显示当前配置，方便调试
console.log("服务器配置:", { API_BASE, WS_BASE });

function App() {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("playerName") || "";
  });
  const [roomId, setRoomId] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存用户信息到本地存储
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  // 获取当前服务器地址
  const getCurrentApiBase = () => `http://${SERVER_HOST}:${SERVER_PORT}`;
  const getCurrentWsBase = () => `ws://${SERVER_HOST}:${SERVER_PORT}`;

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

    const wsUrl = `${getCurrentWsBase()}/ws`;
    addMessage(`正在连接到: ${wsUrl}`);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // 发送连接信息
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
        setIsJoined(true);
        setCurrentRoom(roomId);
        addMessage(`🎮 成功连接并加入房间: ${roomId}`);
      } else {
        handleWebSocketMessage(message);
      }
    };

    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      setIsJoined(false);

      if (event.code === 4004) {
        addMessage(`❌ ${event.reason}`, "error");
      } else if (event.code === 4000) {
        addMessage(`❌ ${event.reason}`, "error");
      } else if (event.code === 4001) {
        addMessage(`❌ ${event.reason}`, "error");
      } else {
        addMessage("WebSocket连接关闭");
      }
    };

    wsRef.current.onerror = (error) => {
      addMessage(`WebSocket错误: ${error}`, "error");
      setWsConnected(false);
      setIsJoined(false);
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
        break;
      case "chat_message":
        addMessage(
          `${message.data.player_name}: ${message.data.message}`,
          "chat"
        );
        break;
      case "game_action":
        addMessage(
          `🎯 ${message.data.player_name} 执行操作: ${message.data.action}`
        );
        break;
      default:
        addMessage(`收到消息: ${JSON.stringify(message)}`);
    }
  };

  const createRoom = async () => {
    if (!roomId.trim()) {
      addMessage("请输入房间ID", "error");
      return;
    }

    try {
      const apiUrl = `${getCurrentApiBase()}/rooms/create`;
      addMessage(`正在创建房间: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
        }),
      });
      const data = await response.json();

      if (data.success) {
        addMessage(`房间 ${roomId} 创建成功`);
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(data.message, "error");
      }
    } catch (error) {
      addMessage(`创建房间失败: ${error.message}`, "error");
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      addMessage("请输入房间ID", "error");
      return;
    }

    try {
      const apiUrl = `${getCurrentApiBase()}/rooms/join`;
      addMessage(`正在加入房间: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          player_name: playerName,
        }),
      });
      const data = await response.json();

      if (data.success) {
        addMessage(`成功加入房间 ${roomId}`);
        connectWebSocket(playerName, roomId);
      } else {
        addMessage(data.message, "error");
      }
    } catch (error) {
      addMessage(`加入房间失败: ${error.message}`, "error");
    }
  };

  const sendChatMessage = () => {
    if (!wsRef.current || !isJoined || !chatMessage.trim()) {
      addMessage("请先连接并输入消息", "error");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "chat_message",
        data: { message: chatMessage.trim() },
      })
    );

    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🎮 多人游戏大厅
        </h1>

        {/* 玩家信息和房间控制 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            🎮 游戏大厅
          </h2>

          {!isJoined ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    玩家名称
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入你的名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房间ID
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入房间ID"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createRoom}
                  disabled={!playerName.trim() || !roomId.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🏗️ 创建房间
                </button>
                <button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !roomId.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🚪 加入房间
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    玩家名称
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {playerName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    当前房间
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {currentRoom}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800">
                  🟢 已连接到房间
                </div>
                <button
                  onClick={() => {
                    if (wsRef.current) {
                      wsRef.current.close();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  🚪 离开房间
                </button>
              </div>
            </div>
          )}
        </div>

        {isJoined && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 玩家列表 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                在线玩家
              </h2>

              {players.length > 0 ? (
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-700">
                          {player.name}
                        </div>
                      </div>
                      <div className="text-green-600 text-sm">🟢 在线</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <div>暂无其他玩家</div>
                  <div className="text-sm">等待其他玩家加入...</div>
                </div>
              )}
            </div>

            {/* 聊天区域 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                消息记录
              </h2>

              <div className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-2 p-2 rounded text-sm ${
                      message.type === "error"
                        ? "bg-red-100 text-red-700"
                        : message.type === "chat"
                        ? "bg-blue-100 text-blue-700"
                        : message.type === "game"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="font-medium">[{message.timestamp}]</span>{" "}
                    {message.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入聊天消息..."
                  disabled={!wsConnected}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!wsConnected || !chatMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  💬 发送
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
