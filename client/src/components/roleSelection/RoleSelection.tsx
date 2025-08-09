import { useState } from "react";
import { useGame } from "../../context/GameContextCore";
import RoleList from "./RoleList";
import { ROLES } from "../../const/roles";

/**
 * 角色选择组件
 * 玩家选择游戏角色的页面
 */
function RoleSelection() {
  const { players, playerName, handleRoleSelect, selectedRoles } = useGame();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  /**
   * 处理角色选择
   * @param roleId - 角色ID
   */
  const handleRoleSelectClick = (roleId: string): void => {
    if (selectedRoles.includes(roleId.toLowerCase())) return;
    if (selectedRole) return; // 已经选择过角色

    setSelectedRole(roleId);
    handleRoleSelect(roleId);
  };

  const currentPlayer = players.find((p) => p.name === playerName);
  const hasSelectedRole = currentPlayer?.role || selectedRole;

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      <div className="text-center text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed py-8">
        选择角色
      </div>

      {/* 角色选择区域 */}
      <RoleList
        roles={ROLES}
        selectedRole={selectedRole}
        currentPlayerRole={currentPlayer?.role}
        selectedRoles={selectedRoles}
        hasSelectedRole={!!hasSelectedRole}
        onRoleSelect={handleRoleSelectClick}
      />
    </div>
  );
}

export default RoleSelection;
