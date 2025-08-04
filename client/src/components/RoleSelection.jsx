import { useState } from "react";

// 角色定义
const ROLES = [
  {
    id: "CEO",
    image: "/CEO.png",
  },
  {
    id: "CMO",
    image: "/CMO.png",
  },
  {
    id: "CTO",
    image: "/CTO.png",
  },
  {
    id: "COO",
    image: "/COO.png",
  },
];

function RoleSelection({
  players = [],
  playerName,
  onRoleSelect,
  selectedRoles = [],
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

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      <div className="text-center text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed py-8">
        选择角色
      </div>

      {/* 角色选择区域 */}
      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-md mx-auto w-full">
        {ROLES.map((role) => {
          const isSelected =
            selectedRole === role.id ||
            currentPlayer?.role === role.id.toLowerCase();
          const isOccupied =
            selectedRoles.includes(role.id.toLowerCase()) && !isSelected;

          return (
            <div key={role.id} className="relative flex flex-col items-center">
              {/* 选中状态的背景高亮 */}
              {isSelected && (
                <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse -z-10" />
              )}

              <div className="relative w-full">
                <img
                  className={`w-full h-32 object-cover cursor-pointer transition-all duration-300 rounded-lg ${
                    isOccupied
                      ? "opacity-30"
                      : isSelected
                      ? "ring-4 ring-yellow-400 ring-opacity-80 shadow-lg shadow-yellow-400/50 brightness-110"
                      : "hover:brightness-110 hover:shadow-md"
                  }`}
                  src={role.image}
                  alt={role.id}
                  onClick={() =>
                    !isOccupied && !hasSelectedRole && handleRoleSelect(role.id)
                  }
                />

                {/* 选中状态的勾选标记 */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center z-20 animate-bounce">
                    <svg
                      className="w-5 h-5 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelection;
