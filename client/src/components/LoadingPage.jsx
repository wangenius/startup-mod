function LoadingPage({ roomId, playerName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🎮 游戏正在启动
            </h1>
            <p className="text-gray-600">房间ID: {roomId}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="animate-pulse w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="animate-pulse w-3 h-3 bg-purple-500 rounded-full" style={{animationDelay: '0.2s'}}></div>
                <div className="animate-pulse w-3 h-3 bg-purple-500 rounded-full" style={{animationDelay: '0.4s'}}></div>
              </div>
              <h2 className="text-lg font-semibold text-purple-800 mb-2">
                🤖 AI正在生成游戏背景
              </h2>
              <p className="text-purple-600 text-sm">
                正在根据所有玩家的创业想法生成独特的游戏背景故事...
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-md font-medium text-blue-800 mb-2">
                ⚡ 即将开始
              </h3>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>• 角色选择阶段</li>
                <li>• 5轮策略决策</li>
                <li>• 团队协作挑战</li>
              </ul>
            </div>

            <div className="text-gray-500 text-xs">
              玩家: {playerName} | 请耐心等待，通常需要10-30秒
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;