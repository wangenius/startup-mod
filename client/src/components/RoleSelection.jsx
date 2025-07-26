import { useState } from "react";

// 角色定义
const ROLES = [
  {
    id: "CEO",
    name: "马森",
    image: "/CEO.png",
    position: {
      top: 104,
      roleLabel: { top: 713, left: 176 },
      nameLabel: { top: 765, left: 295 },
    },
  },
  {
    id: "CMO",
    name: "林燃",
    image: "/CMO.png",
    position: { top: 278, roleLabel: null, nameLabel: { top: 243, left: 295 } },
  },
  {
    id: "CTO",
    name: "周昊",
    image: "/CTO.png",
    position: {
      top: 452,
      roleLabel: { top: 360, left: 176 },
      nameLabel: { top: 417, left: 295 },
    },
  },
  {
    id: "COO",
    name: "郑雪",
    image: "/COO.png",
    position: { top: 626, roleLabel: null, nameLabel: { top: 591, left: 295 } },
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
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="left-[159px] top-[58px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        选择角色
      </div>

      {/* 角色图片 */}
      {ROLES.map((role) => {
        const isSelected =
          selectedRole === role.id ||
          currentPlayer?.role === role.id.toLowerCase();
        const isOccupied =
          selectedRoles.includes(role.id.toLowerCase()) && !isSelected;

        return (
          <div key={role.id} className="relative">
            {/* 选中状态的背景高亮 */}
            {isSelected && (
              <div 
                className={`w-72 h-40 left-[64px] top-[${role.position.top}px] absolute bg-yellow-400/20 rounded-lg animate-pulse`}
                style={{ zIndex: 0 }}
              />
            )}
            
            <img
              className={`w-72 h-40 left-[64px] top-[${
                role.position.top
              }px] absolute cursor-pointer transition-all duration-300 ${
                isOccupied 
                  ? "opacity-30" 
                  : isSelected 
                  ? "ring-4 ring-yellow-400 ring-opacity-80 shadow-lg shadow-yellow-400/50 brightness-110 z-10" 
                  : "hover:brightness-110 hover:shadow-md z-10"
              }`}
              src={role.image}
              onClick={() =>
                !isOccupied && !hasSelectedRole && handleRoleSelect(role.id)
              }
            />
            
            {/* 选中状态的勾选标记 */}
            {isSelected && (
              <div 
                className={`absolute top-[${role.position.top + 10}px] left-[310px] w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center z-20 animate-bounce`}
              >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* 角色标签 */}
            {role.position.roleLabel && (
              <div
                className={`left-[${role.position.roleLabel.left}px] top-[${role.position.roleLabel.top}px] absolute text-center justify-start text-black text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed`}
              >
                {role.id}
              </div>
            )}

            {/* 角色名称 */}
            <div
              className={`left-[${role.position.nameLabel.left}px] top-[${role.position.nameLabel.top}px] absolute text-right justify-end text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]`}
            >
              {isOccupied
                ? players.find((p) => p.role === role.id.toLowerCase())?.name ||
                  role.name
                : isSelected
                ? "已选择"
                : role.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RoleSelection;
