/**
 * 角色定义接口
 */
export interface Role {
  /** 角色ID */
  id: string;
  /** 角色图片路径 */
  image: string;
}

/**
 * 角色选择相关的props接口
 */
export interface RoleCardProps {
  /** 角色信息 */
  role: Role;
  /** 是否被当前玩家选中 */
  isSelected: boolean;
  /** 是否被其他玩家占用 */
  isOccupied: boolean;
  /** 是否已经选择过角色（禁用点击） */
  hasSelectedRole: boolean;
  /** 角色选择回调 */
  onRoleSelect: (roleId: string) => void;
}

/**
 * 角色列表组件的props接口
 */
export interface RoleListProps {
  /** 角色列表 */
  roles: Role[];
  /** 已选择的角色 */
  selectedRole: string | null;
  /** 当前玩家角色 */
  currentPlayerRole?: string;
  /** 已被选择的角色列表 */
  selectedRoles: string[];
  /** 是否已经选择过角色 */
  hasSelectedRole: boolean;
  /** 角色选择回调 */
  onRoleSelect: (roleId: string) => void;
}
