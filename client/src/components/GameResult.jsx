import { useState } from 'react';

function GameResult({ gameResult, players, onRestartGame }) {
  const [showDetails, setShowDetails] = useState(false);

  const getSuccessLevel = (score) => {
    if (score >= 90) return { level: '巨大成功', color: 'text-green-600', icon: '🚀' };
    if (score >= 70) return { level: '成功', color: 'text-blue-600', icon: '✅' };
    if (score >= 50) return { level: '一般', color: 'text-yellow-600', icon: '⚠️' };
    return { level: '失败', color: 'text-red-600', icon: '❌' };
  };

  const successInfo = getSuccessLevel(gameResult.finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 主要结果 */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
          <div className="text-6xl mb-4">{successInfo.icon}</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">游戏结束</h1>
          <h2 className={`text-2xl font-semibold mb-4 ${successInfo.color}`}>
            {successInfo.level}
          </h2>
          <div className="text-3xl font-bold text-gray-700 mb-4">
            最终得分: {gameResult.finalScore}/100
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {gameResult.summary}
          </p>
        </div>

        {/* 详细统计 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">📊 详细统计</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showDetails ? '收起详情' : '展开详情'}
            </button>
          </div>
          
          {/* 关键指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {gameResult.metrics?.userGrowth || 0}%
              </div>
              <div className="text-sm text-gray-600">用户增长</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${gameResult.metrics?.revenue || 0}K
              </div>
              <div className="text-sm text-gray-600">营收</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {gameResult.metrics?.marketShare || 0}%
              </div>
              <div className="text-sm text-gray-600">市场份额</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {gameResult.metrics?.teamSize || 0}
              </div>
              <div className="text-sm text-gray-600">团队规模</div>
            </div>
          </div>
          
          {/* 详细信息 */}
          {showDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🎯 关键成就</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {gameResult.achievements?.map((achievement, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        {achievement}
                      </li>
                    )) || [
                      <li key="default" className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        完成了创业模拟游戏
                      </li>
                    ]}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 发展历程</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {gameResult.timeline?.map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-3 mt-1">
                          第{index + 1}轮
                        </div>
                        <div className="text-gray-700">{event}</div>
                      </div>
                    )) || [
                      <div key="default" className="text-gray-600">
                        游戏历程记录暂无详细信息
                      </div>
                    ]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 玩家表现 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">🏆 玩家表现</h2>
          <div className="space-y-3">
            {players.map((player, index) => {
              const playerScore = gameResult.playerScores?.[player.name] || Math.floor(Math.random() * 40) + 60;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-700">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {playerScore}/100
                    </div>
                    <div className="text-sm text-gray-600">
                      {getSuccessLevel(playerScore).level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="text-center">
          <button
            onClick={onRestartGame}
            className="bg-blue-600 text-white py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            🔄 重新开始游戏
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameResult;