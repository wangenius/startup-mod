import { useState } from 'react';

function EventGeneration({ 
  playerName, 
  currentRound, 
  onEventGenerated,
  onStartRound 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvent, setGeneratedEvent] = useState(null);
  const [error, setError] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);

  // 获取服务器配置
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

  // 生成事件
  const generateEvent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/generate-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round: currentRound,
          player_name: playerName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const eventData = await response.json();
      setGeneratedEvent(eventData);
      
      // 添加到历史记录
      setEventHistory(prev => [...prev, {
        round: currentRound,
        event: eventData,
        timestamp: new Date().toLocaleString()
      }]);

      // 通知父组件事件已生成
      if (onEventGenerated) {
        onEventGenerated(eventData);
      }

    } catch (err) {
      console.error('生成事件失败:', err);
      setError(`生成事件失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 开始轮次
  const handleStartRound = () => {
    if (generatedEvent && onStartRound) {
      onStartRound(generatedEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              🎲 第 {currentRound} 轮事件生成
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">当前玩家</div>
              <div className="text-lg font-semibold text-purple-600">
                {playerName}
              </div>
            </div>
          </div>
        </div>

        {/* 事件生成区域 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            🎯 生成游戏事件
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              点击下方按钮为第 {currentRound} 轮生成新的游戏事件和决策选项。
            </p>
            
            <button
              onClick={generateEvent}
              disabled={isGenerating}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  正在生成事件...
                </div>
              ) : (
                '🎲 生成事件'
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-medium">❌ 错误</div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* 生成的事件显示 */}
        {generatedEvent && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              📋 生成的事件
            </h2>
            
            <div className="space-y-4">
              {/* 事件描述 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  📖 事件描述
                </h3>
                <p className="text-blue-700">{generatedEvent.description}</p>
              </div>

              {/* 决策选项 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  🎯 决策选项
                </h3>
                <div className="space-y-2">
                  {generatedEvent.options?.map((option, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-green-300">
                      <div className="font-medium text-green-800">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 私人信息提示 */}
              {generatedEvent.private_messages && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    🔒 私人信息
                  </h3>
                  <p className="text-yellow-700">
                    每位玩家都有专属的私人信息，请在游戏中查看。
                  </p>
                </div>
              )}

              {/* 开始轮次按钮 */}
              <button
                onClick={handleStartRound}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                🚀 开始第 {currentRound} 轮游戏
              </button>
            </div>
          </div>
        )}

        {/* 事件历史 */}
        {eventHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              📚 事件历史
            </h2>
            
            <div className="space-y-3">
              {eventHistory.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">
                      第 {item.round} 轮
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {item.event.description?.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventGeneration;