interface PlayerStatusCardProps {
  player: {
    name: string;
    role: string;
  };
  isCurrentPlayer: boolean;
  hasSubmitted: boolean;
  getRoleImage: (role: string) => string;
}

/**
 * 玩家状态卡片组件 - 极简版本
 */
export const PlayerStatusCard = ({ 
  player, 
  isCurrentPlayer, 
  hasSubmitted, 
  getRoleImage 
}: PlayerStatusCardProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* 头像 */}
      <div className="relative">
        <img 
          className={`w-14 h-14 rounded-full border-2 transition-opacity duration-200 ${
            hasSubmitted ? 'border-green-400' : 
            isCurrentPlayer ? 'border-blue-400' : 'border-gray-600'
          } ${
            hasSubmitted || isCurrentPlayer ? 'opacity-100' : 'opacity-60'
          }`}
          src={getRoleImage(player.role || '')} 
          alt={player.role} 
        />
        
        {/* 简单的状态指示 */}
        {hasSubmitted && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-green-400/90 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>

      {/* 玩家信息 */}
      <div className="text-center">
        <div className={`text-sm font-medium ${
          isCurrentPlayer ? 'text-blue-300' : 'text-white'
        }`}>
          {player.name}
        </div>
      </div>
    </div>
  );
};
