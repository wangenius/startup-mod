import { useState } from 'react';

const ROLES = [
  {
    id: 'CEO',
    name: 'CEO (首席执行官)',
    description: '负责公司整体战略规划和重大决策',
    icon: '👔',
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 'CTO',
    name: 'CTO (首席技术官)',
    description: '负责技术架构和产品开发',
    icon: '💻',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'CMO',
    name: 'CMO (首席营销官)',
    description: '负责市场营销和品牌推广',
    icon: '📈',
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'COO',
    name: 'COO (首席运营官)',
    description: '负责日常运营和业务执行',
    icon: '⚙️',
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  }
];

function RoleSelection({ players, playerName, onRoleSelect, selectedRoles, gameBackground }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (roleId) => {
    if (selectedRoles.includes(roleId)) return;
    setSelectedRole(roleId);
    onRoleSelect(roleId);
  };

  const currentPlayer = players.find(p => p.name === playerName);
  const hasSelectedRole = currentPlayer?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎭 选择您的身份</h1>
            <p className="text-gray-600">每个角色都有不同的职责和决策权限</p>
          </div>
          
          {/* 游戏背景故事 */}
          {gameBackground && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📖 游戏背景故事
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  {typeof gameBackground === 'string' ? (
                    <p className="whitespace-pre-wrap">{gameBackground}</p>
                  ) : (
                    <div>
                      {gameBackground.title && (
                        <h3 className="text-lg font-medium mb-2">{gameBackground.title}</h3>
                      )}
                      {gameBackground.story && (
                        <p className="whitespace-pre-wrap">{gameBackground.story}</p>
                      )}
                      {gameBackground.description && (
                        <p className="whitespace-pre-wrap">{gameBackground.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 角色选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id || currentPlayer?.role === role.id.toLowerCase();
              const isOccupied = selectedRoles.includes(role.id.toLowerCase()) && !isSelected;
              const occupiedBy = players.find(p => p.role === role.id.toLowerCase());
              
              return (
                <div
                  key={role.id}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : isOccupied
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => !isOccupied && !hasSelectedRole && handleRoleSelect(role.id)}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{role.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">{role.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                  
                  {isOccupied && occupiedBy && (
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                        已被 {occupiedBy.name} 选择
                      </span>
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 border-blue-300 text-blue-800">
                        ✅ 已选择
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 玩家状态 */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">👥 玩家状态</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, index) => {
                const playerRole = ROLES.find(r => r.id.toLowerCase() === player.role);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-700">
                        {player.name} {player.name === playerName && '(你)'}
                      </div>
                      {playerRole && (
                        <div className="text-sm text-gray-600">
                          {playerRole.icon} {playerRole.name}
                        </div>
                      )}
                    </div>
                    <div className={`text-sm ${
                      player.role ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {player.role ? '✅ 已选择角色' : '⏳ 选择中'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 等待提示 */}
          {players.every(p => p.role) && (
            <div className="mt-8 text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎉 所有玩家已选择角色，游戏即将开始！</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;