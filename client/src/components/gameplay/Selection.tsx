import { Button } from '../Button';
import { PlayerInfo } from './PlayerInfo';

interface SelectionProps {
  playerName: string;
  playerRole: string;
  currentRound: number;
  roundEvent: any;
  privateMessages: Record<string, string>;
  selectedAction: string;
  hasSubmitted: boolean;
  selectionTimeLeft: number;
  players: any[];
  playerActions: any[];
  getRoleImage: (role: string) => string;
  onShowEventModal: () => void;
  onShowPrivateModal: () => void;
  onSelectAction: (action: string) => void;
  onSubmitAction: () => void;
}

/**
 * 4. 选择确认阶段组件
 */
export const Selection = ({
  playerName,
  playerRole,
  currentRound,
  roundEvent,
  privateMessages,
  selectedAction,
  hasSubmitted,
  selectionTimeLeft,
  players,
  playerActions,
  getRoleImage,
  onShowEventModal,
  onShowPrivateModal,
  onSelectAction,
  onSubmitAction
}: SelectionProps) => {
  // 调试信息
  console.log('Selection组件数据:', {
    players,
    playerActions,
    currentRound,
    playerName
  });

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 顶部玩家信息 */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="mb-4">
          <PlayerInfo
            playerName={playerName}
            playerRole={playerRole}
            getRoleImage={getRoleImage}
            showRoleBelow={true}
          />
        </div>

        <div
          className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-4"
          onClick={onShowEventModal}
        >
          第{currentRound}阶段
        </div>
      </div>

      {/* 私人信息 - 选择阶段版本 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div className="px-4 mb-6">
          <div
            className="relative cursor-pointer hover:scale-105 transition-transform duration-200 max-w-sm mx-auto"
            onClick={onShowPrivateModal}
          >
            <img className="w-full h-auto" src="./paper.png" alt="私人信息" />
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
              <div className="opacity-60 text-neutral-600 text-sm font-normal font-['Cactus_Classical_Serif'] uppercase leading-none mb-2">
                仅你可见，点击可以展开
              </div>
              <div className="text-center text-zinc-800 text-base font-normal font-['Cactus_Classical_Serif'] [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)] overflow-hidden">
                <div className="line-clamp-3 px-2">
                  {privateMessages[String(playerRole).toUpperCase()]}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center">
                <img className="w-6 h-6" src="./print.png" alt="印章" />
                <div className="ml-1 text-gray-200 text-sm font-normal font-['FZLanTingHeiS-H-GB'] [text-shadow:_1px_1px_1px_rgb(103_43_43_/_0.57)]">
                  秘
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 选择提示 */}
      <div className="text-center mb-6">
        <div className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
          请做出{playerRole}的选择
        </div>
      </div>

      {/* 所有玩家选择状态 */}
      {players && players.length > 0 && (
        <div className="flex justify-center mb-6">
          <div className="flex gap-4 p-4 bg-black/20 rounded-lg backdrop-blur-sm">
            {players.map((player) => {
                const hasPlayerSubmitted = playerActions?.some(
                  action => action.playerName === player.name && action.round === currentRound
                );
                const isCurrentPlayer = player.name === playerName;
                
                console.log(`玩家 ${player.name} 提交状态:`, hasPlayerSubmitted, {
                  playerActions,
                  currentRound,
                  playerName: player.name,
                  isCurrentPlayer,
                  matchingActions: playerActions?.filter(action => action.playerName === player.name),
                  allPlayerNames: playerActions?.map(action => action.playerName),
                  actionRounds: playerActions?.map(action => action.round)
                });
                
                return (
                  <div key={player.name} className={`flex flex-col items-center space-y-2 ${
                    isCurrentPlayer ? 'relative' : ''
                  }`}>
                    {/* 当前玩家标识 */}
                    {isCurrentPlayer && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-500 rounded-full">
                        <span className="text-white text-xs font-bold">我</span>
                      </div>
                    )}
                    <div className="relative">
                      <img 
                        className={`w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                          isCurrentPlayer ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                        }`}
                        style={{
                          borderColor: hasPlayerSubmitted ? '#10b981' : (isCurrentPlayer ? '#3b82f6' : '#6b7280'),
                          opacity: hasPlayerSubmitted ? 1 : (isCurrentPlayer ? 1 : 0.6)
                        }}
                        src={getRoleImage(player.role || '')} 
                        alt={player.role} 
                      />
                      {hasPlayerSubmitted && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-normal font-['Cactus_Classical_Serif'] ${
                        isCurrentPlayer ? 'text-blue-300 font-medium' : 'text-white'
                      }`}>
                        {player.name}
                      </div>
                      <div className={`text-xs font-normal font-['Cactus_Classical_Serif'] ${
                        isCurrentPlayer ? 'text-blue-200' : 'text-gray-300'
                      }`}>
                        {player.role}
                      </div>
                      <div className={`text-xs font-normal font-['Cactus_Classical_Serif'] ${
                        hasPlayerSubmitted ? 'text-green-400' : (isCurrentPlayer ? 'text-blue-300' : 'text-yellow-400')
                      }`}>
                        {hasPlayerSubmitted ? '已提交' : (isCurrentPlayer ? '等待确认' : '选择中...')}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 选择选项 */}
      <div className="flex-1 px-4 mb-6">
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          {roundEvent?.decision_options ? (
            Object.entries(roundEvent.decision_options).map(([key, action]) => (
              <div
                key={key}
                className={`h-16 px-6 py-2.5 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                  selectedAction === key ? "bg-white" : "bg-neutral-700"
                }`}
                onClick={() => onSelectAction(key)}
              >
                <div
                  className={`text-center text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight ${
                    selectedAction === key ? "text-black" : "text-white"
                  }`}
                >
                  {key}.{String(action)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center">选项加载中...</div>
          )}
        </div>
      </div>

      {/* 底部按钮和倒计时 */}
      <div className="flex flex-col items-center pb-8 space-y-4">
        {!hasSubmitted ? (
          <Button onClick={onSubmitAction}>确认</Button>
        ) : (
          <div className="text-center">
            <div className="text-green-400 text-xl font-bold mb-2">
              ✅ 已提交选择
            </div>
            <div className="text-white">等待其他玩家...</div>
          </div>
        )}

        {/* 倒计时 */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
            <span className="text-white text-base font-normal font-['Cactus_Classical_Serif']">
              {selectionTimeLeft}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
