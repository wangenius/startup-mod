import { useState } from 'react';

function GameLobby({ roomId, players, playerName, onStartupIdeaSubmit, onStartGame, isHost }) {
  const [startupIdea, setStartupIdea] = useState('');
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);

  const handleSubmitIdea = () => {
    if (startupIdea.trim()) {
      onStartupIdeaSubmit(startupIdea.trim());
      setIdeaSubmitted(true);
    }
  };

  const allPlayersReady = players.length >= 2 && players.every(p => p.startup_idea);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🏢 游戏等待室</h1>
            <p className="text-gray-600">房间ID: {roomId}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 玩家列表 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">👥 玩家列表</h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-700">
                        {player.name} {player.name === playerName && '(你)'}
                      </div>
                      {player.isHost && (
                        <div className="text-sm text-blue-600">👑 房主</div>
                      )}
                    </div>
                    <div className={`text-sm ${
                      player.startup_idea ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {player.startup_idea ? '✅ 已提交想法' : '⏳ 等待中'}
                    </div>
                  </div>
                ))}
              </div>
              
              {players.length < 2 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ 至少需要2名玩家才能开始游戏
                  </p>
                </div>
              )}
            </div>
            
            {/* 创业想法输入 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">💡 创业想法</h2>
              {!ideaSubmitted ? (
                <div className="space-y-4">
                  <textarea
                    value={startupIdea}
                    onChange={(e) => setStartupIdea(e.target.value)}
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="请输入您的创业想法和项目描述..."
                  />
                  <button
                    onClick={handleSubmitIdea}
                    disabled={!startupIdea.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    📝 提交想法
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 mb-2">✅ 您的创业想法已提交</p>
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                    {startupIdea}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 开始游戏按钮 */}
          {isHost && (
            <div className="mt-8 text-center">
              <button
                onClick={onStartGame}
                disabled={!allPlayersReady}
                className="bg-green-600 text-white py-4 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
              >
                {allPlayersReady ? '🚀 开始游戏' : '⏳ 等待所有玩家提交想法'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameLobby;