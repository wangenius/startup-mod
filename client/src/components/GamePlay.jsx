import { useState, useEffect } from "react";

function GamePlay({
  gameState,
  playerName,
  currentRound,
  roundInfo,
  onActionSubmit,
  waitingForPlayers,
  playerActions,
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  // 根据角色获取可用行动
  const getAvailableActions = (role) => {
    if (!role) return [];

    // 将角色转换为大写以匹配键名
    const roleKey = role.toUpperCase();

    const actions = {
      CEO: [
        {
          id: "strategic_decision",
          name: "制定战略决策",
          description: "制定公司整体发展战略",
        },
        {
          id: "funding_round",
          name: "启动融资",
          description: "寻求投资者进行融资",
        },
        {
          id: "partnership",
          name: "建立合作关系",
          description: "与其他公司建立战略合作",
        },
        {
          id: "pivot_strategy",
          name: "调整商业模式",
          description: "根据市场反馈调整商业模式",
        },
      ],
      CTO: [
        {
          id: "develop_feature",
          name: "开发新功能",
          description: "开发产品核心功能",
        },
        {
          id: "tech_architecture",
          name: "优化技术架构",
          description: "提升系统性能和稳定性",
        },
        {
          id: "hire_developers",
          name: "招聘开发人员",
          description: "扩充技术团队",
        },
        {
          id: "tech_research",
          name: "技术调研",
          description: "研究新技术和解决方案",
        },
      ],
      CMO: [
        {
          id: "marketing_campaign",
          name: "营销推广",
          description: "制定和执行营销活动",
        },
        {
          id: "brand_building",
          name: "品牌建设",
          description: "提升品牌知名度和影响力",
        },
        {
          id: "user_acquisition",
          name: "用户获取",
          description: "通过各种渠道获取新用户",
        },
        {
          id: "market_research",
          name: "市场调研",
          description: "分析市场趋势和竞争对手",
        },
      ],
      COO: [
        {
          id: "optimize_operations",
          name: "优化运营",
          description: "提升运营效率和质量",
        },
        { id: "scale_team", name: "团队扩张", description: "招聘和培训新员工" },
        {
          id: "process_improvement",
          name: "流程改进",
          description: "优化内部工作流程",
        },
        {
          id: "cost_control",
          name: "成本控制",
          description: "控制和优化运营成本",
        },
      ],
    };
    return actions[roleKey] || [];
  };

  const availableActions = getAvailableActions(playerRole);

  // 调试信息
  console.log(
    "Debug - playerRole:",
    playerRole,
    "availableActions:",
    availableActions
  );

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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                📋 本轮情况
              </h2>
              <p className="text-blue-700">{roundInfo}</p>
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
                  {availableActions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAction === action.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedAction(action.id)}
                    >
                      <div className="font-medium text-gray-800">
                        {action.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </div>
                    </div>
                  ))}
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
