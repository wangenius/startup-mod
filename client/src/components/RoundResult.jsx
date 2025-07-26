import { useState } from 'react';

function RoundResult({ 
  roundNumber, 
  playerActions, 
  players,
  playerName,
  onContinueToNextRound 
}) {
  const [showDetails, setShowDetails] = useState(false);

  // 获取角色对应的图标
  const getRoleIcon = (role) => {
    const icons = {
      'ceo': '👔',
      'cto': '💻', 
      'cmo': '📈',
      'coo': '⚙️'
    };
    return icons[role?.toLowerCase()] || '👤';
  };

  // 获取行动对应的图标
  const getActionIcon = (actionId) => {
    const icons = {
      'strategic_decision': '🎯',
      'funding_round': '💰',
      'partnership': '🤝',
      'pivot_strategy': '🔄',
      'develop_feature': '⚡',
      'tech_architecture': '🏗️',
      'hire_developers': '👥',
      'tech_research': '🔬',
      'marketing_campaign': '📢',
      'brand_building': '🏆',
      'user_acquisition': '📊',
      'market_research': '📋',
      'optimize_operations': '⚙️',
      'scale_team': '📈',
      'process_improvement': '🔧',
      'cost_control': '💵'
    };
    return icons[actionId] || '📝';
  };

  // 获取行动名称
  const getActionName = (actionId) => {
    const names = {
      'strategic_decision': '制定战略决策',
      'funding_round': '启动融资',
      'partnership': '建立合作关系',
      'pivot_strategy': '调整商业模式',
      'develop_feature': '开发新功能',
      'tech_architecture': '优化技术架构',
      'hire_developers': '招聘开发人员',
      'tech_research': '技术调研',
      'marketing_campaign': '营销推广',
      'brand_building': '品牌建设',
      'user_acquisition': '用户获取',
      'market_research': '市场调研',
      'optimize_operations': '优化运营',
      'scale_team': '团队扩张',
      'process_improvement': '流程改进',
      'cost_control': '成本控制'
    };
    return names[actionId] || actionId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 轮次结果标题 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            第 {roundNumber} 轮结果
          </h1>
          <p className="text-gray-600">
            所有玩家已完成行动选择，查看本轮结果
          </p>
        </div>

        {/* 玩家行动汇总 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">🎯 玩家行动汇总</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showDetails ? '收起详情' : '展开详情'}
            </button>
          </div>
          
          <div className="space-y-4">
            {playerActions?.map((action, index) => {
              const player = players?.find(p => p.name === action.player);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getRoleIcon(player?.role)}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800">
                          {action.player}
                        </div>
                        <div className="text-sm text-gray-600">
                          {player?.role?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="text-xl mr-2">
                        {getActionIcon(action.action)}
                      </span>
                      <span className="font-medium">
                        {getActionName(action.action)}
                      </span>
                    </div>
                  </div>
                  
                  {showDetails && action.reason && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        决策理由：
                      </div>
                      <div className="text-sm text-gray-600">
                        {action.reason}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 轮次影响 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">📈 轮次影响</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="font-medium text-green-800">积极影响</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 团队协作效率提升</li>
                <li>• 产品功能得到完善</li>
                <li>• 市场认知度增加</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 text-xl mr-2">⚠️</span>
                <span className="font-medium text-yellow-800">需要关注</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 资金消耗需要控制</li>
                <li>• 竞争对手动向</li>
                <li>• 团队规模扩张风险</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 继续按钮 */}
        <div className="text-center">
          {roundNumber < 5 ? (
            <div>
              {players?.find(p => p.name === playerName)?.isHost ? (
                <button
                  onClick={onContinueToNextRound}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  🚀 进入第 {roundNumber + 1} 轮
                </button>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 font-medium">
                    ⏳ 等待房主开始下一轮...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                🎉 所有轮次已完成，正在计算最终结果...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoundResult;