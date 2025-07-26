import { useState } from "react";

// 角色定义
const ROLES = [
  { id: "CEO", name: "创始人", icon: "👔" },
  { id: "CTO", name: "技术负责人", icon: "💻" },
  { id: "CMO", name: "市场负责人", icon: "📈" },
  { id: "COO", name: "运营负责人", icon: "⚙️" },
];

function RoleSelection({
  players = [],
  playerName,
  onRoleSelect,
  selectedRoles = [],
  gameBackground,
  onStartGame,
}) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (roleId) => {
    if (selectedRoles.includes(roleId.toLowerCase())) return;
    if (selectedRole) return; // 已经选择过角色

    setSelectedRole(roleId);
    if (onRoleSelect) {
      onRoleSelect(roleId);
    }
  };

  const currentPlayer = players.find((p) => p.name === playerName);
  const hasSelectedRole = currentPlayer?.role || selectedRole;
  const allPlayersSelected = players.length > 0 && players.every((p) => p.role);

  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="left-[159px] top-[58px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        选择角色
      </div>

      {/* 游戏背景故事 */}
      {gameBackground && (
        <div className="absolute top-[90px] left-[20px] right-[20px] bg-gray-800 bg-opacity-80 rounded-lg p-4 max-h-[100px] overflow-y-auto">
          <div className="text-white text-sm font-['Space_Grotesk']">
            {typeof gameBackground === "string" ? (
              <p className="whitespace-pre-wrap">{gameBackground}</p>
            ) : (
              <div>
                {gameBackground.title && (
                  <h3 className="font-medium mb-2">{gameBackground.title}</h3>
                )}
                {gameBackground.story && (
                  <p className="whitespace-pre-wrap">{gameBackground.story}</p>
                )}
                {gameBackground.description && (
                  <p className="whitespace-pre-wrap">
                    {gameBackground.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-72 left-[67px] top-[200px] absolute inline-flex flex-col justify-start items-start gap-2">
        {ROLES.map((role) => {
          const isSelected =
            selectedRole === role.id ||
            currentPlayer?.role === role.id.toLowerCase();
          const isOccupied =
            selectedRoles.includes(role.id.toLowerCase()) && !isSelected;
          const occupiedBy = players.find(
            (p) => p.role === role.id.toLowerCase()
          );

          return (
            <div
              key={role.id}
              className={`w-72 h-40 relative bg-black rounded-xl outline outline-[0.78px] outline-offset-[-0.78px] overflow-hidden cursor-pointer transition-all ${
                isSelected
                  ? "outline-blue-400"
                  : isOccupied
                  ? "outline-gray-500 cursor-not-allowed opacity-60"
                  : "outline-white hover:outline-gray-300"
              }`}
              onClick={() =>
                !isOccupied && !hasSelectedRole && handleRoleSelect(role.id)
              }
            >
              <div className="w-20 h-20 left-[144px] top-[60px] absolute bg-gray-200 blur-[50px]" />
              <div className="w-36 h-36 left-[106px] top-[16px] absolute bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-4xl">{role.icon}</span>
              </div>
              <div className="w-96 h-24 left-[-50.77px] top-[108.81px] absolute bg-gradient-to-b from-gray-600 to-blue-200 blur-xl" />
              <div className="left-[20px] top-[16.89px] absolute justify-start text-white text-sm font-normal font-['Space_Grotesk']">
                {role.id}
                <br />
                {role.name}
              </div>
              <div className="left-[229.18px] top-[133.12px] absolute text-right justify-end text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]">
                {isOccupied && occupiedBy
                  ? occupiedBy.name
                  : isSelected
                  ? "已选择"
                  : "可选择"}
              </div>
              <div className="w-72 h-40 left-0 top-0 absolute opacity-5 bg-gradient-to-r from-gray-800 to-gray-600" />
            </div>
          );
        })}
      </div>

      {/* 玩家状态显示 */}
      {players.length > 0 && (
        <div className="absolute bottom-[100px] left-[20px] right-[20px] bg-gray-800 bg-opacity-80 rounded-lg p-4">
          <h3 className="text-white text-sm font-['Space_Grotesk'] mb-2">
            玩家状态:
          </h3>
          <div className="space-y-1">
            {players.map((player, index) => {
              const playerRole = ROLES.find(
                (r) => r.id.toLowerCase() === player.role
              );
              return (
                <div
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-white font-['Space_Grotesk']">
                    {player.name} {player.name === playerName && "(你)"}
                  </span>
                  <span
                    className={`font-['Space_Grotesk'] ${
                      player.role ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {playerRole
                      ? `${playerRole.icon} ${playerRole.name}`
                      : "选择中..."}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 开始游戏按钮 */}
      {allPlayersSelected && (
        <div className="absolute bottom-[40px] left-[20px] right-[20px] space-y-2">
          <div className="bg-green-600 bg-opacity-80 rounded-lg p-3">
            <p className="text-white text-sm font-['Space_Grotesk'] text-center">
              🎉 所有玩家已选择角色！
            </p>
          </div>
          {/* 只有房主可以开始游戏 */}
          {players.find(p => p.name === playerName)?.isHost && onStartGame && (
            <button
              onClick={onStartGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-['Space_Grotesk'] py-3 px-4 rounded-lg transition-colors"
            >
              开始游戏
            </button>
          )}
          {/* 非房主显示等待提示 */}
          {!players.find(p => p.name === playerName)?.isHost && (
            <div className="bg-gray-600 bg-opacity-80 rounded-lg p-3">
              <p className="text-white text-sm font-['Space_Grotesk'] text-center">
                等待房主开始游戏...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoleSelection;
