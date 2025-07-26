import { useState, useEffect } from "react";

function GamePlay({
  gameState,
  playerName,
  currentRound,
  roundInfo,
  roundEvent,
  privateMessages,
  onActionSubmit,
  waitingForPlayers,
  playerActions,
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  console.log(roundEvent);

  useEffect(() => {
    // 重置提交状态当新一轮开始时
    setHasSubmitted(false);
    setSelectedAction("");
  }, [currentRound]);

  const handleSubmitAction = () => {
    if (selectedAction) {
      onActionSubmit({
        action: selectedAction,
        reason: "",
      });
      setHasSubmitted(true);
    }
  };

  const currentPlayer = gameState.players?.find((p) => p.name === playerName);
  const playerRole = currentPlayer?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 游戏状态头部 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🎮 第 {currentRound}/5 轮
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">您的角色</div>
              <div className="text-lg font-semibold text-blue-600">
                {playerRole}
              </div>
            </div>
          </div>

          {/* 当前轮次信息 */}
          {roundInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                📋 本轮情况
              </h2>
              <p className="text-blue-700">{roundInfo}</p>
            </div>
          )}

          {/* 轮次事件 */}
          {roundEvent && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">
                🎲 本轮事件
              </h2>
              <div className="text-purple-700">
                <p>{roundEvent.event_description}</p>
              </div>
            </div>
          )}

          {/* 私人信息 */}
          {privateMessages &&
            privateMessages[String(playerRole).toUpperCase()] && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  🔒 私人信息
                </h2>
                <p className="text-yellow-700">
                  {privateMessages[String(playerRole).toUpperCase()]}
                </p>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 行动选择 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              🎯 选择您的行动
            </h2>

            {!hasSubmitted ? (
              <div className="space-y-4">
                {/* 行动选项 */}
                <div className="space-y-3">
                  {roundEvent?.decision_options ? (
                    Object.entries(roundEvent.decision_options).map(
                      ([key, action]) => (
                        <div
                          key={key}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAction === key
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedAction(key)}
                        >
                          <div className="text-gray-600 mt-1">{key} : {action}</div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
                      <div className="text-gray-600 text-center">
                        等待事件选项加载中...
                      </div>
                    </div>
                  )}
                </div>

                {/* 提交按钮 */}
                <button
                  onClick={handleSubmitAction}
                  disabled={!selectedAction}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  📤 提交行动
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  行动已提交
                </h3>
                <p className="text-gray-600">等待其他玩家完成选择...</p>
              </div>
            )}
          </div>

          {/* 玩家状态 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              👥 玩家状态
            </h2>

            <div className="space-y-3">
              {gameState.players?.map((player, index) => {
                const hasSubmittedAction = playerActions?.some(
                  (action) => action.player === player.name
                );
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-700">
                          {player.name} {player.name === playerName && "(你)"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {player.role}
                        </div>
                      </div>
                      <div
                        className={`text-sm ${
                          hasSubmittedAction
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {hasSubmittedAction ? "✅ 已提交" : "⏳ 思考中"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 等待提示 */}
            {waitingForPlayers && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  ⏳ 等待所有玩家提交行动...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 游戏进度 */}
        <div className="mt-6 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📊 游戏进度
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentRound / 5) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>第 {currentRound} 轮</span>
            <span>共 5 轮</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePlay;
