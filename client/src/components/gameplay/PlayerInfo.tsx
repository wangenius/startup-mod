interface PlayerInfoProps {
  playerName: string;
  playerRole: string;
  getRoleImage: (role: string) => string;
  showRoleBelow?: boolean;
}

/**
 * 玩家信息组件 - 显示玩家头像、姓名和角色
 */
export const PlayerInfo = ({ 
  playerName, 
  playerRole, 
  getRoleImage, 
  showRoleBelow = false 
}: PlayerInfoProps) => {
  return (
    <div className="relative">
      <div className="w-16 h-16 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200/50 blur-[30px]" />
      <img
        className="w-32 h-32 relative z-10"
        src={getRoleImage(playerRole)}
        alt="Player Avatar"
      />
      {!showRoleBelow ? (
        <div className="absolute -bottom-2 -right-2 text-right text-white text-sm font-normal font-['Space_Grotesk'] bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="font-medium">{playerName}</div>
          <div className="text-xs opacity-80">{playerRole}</div>
        </div>
      ) : (
        <div className="text-center text-white text-sm font-normal font-['Space_Grotesk'] mt-2">
          {playerName}
          <br />
          {playerRole}
        </div>
      )}
    </div>
  );
};
