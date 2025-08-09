import { Button } from "../Button";
import { PlayerStatusCard } from "./PlayerStatusCard";

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
  onSubmitAction,
}: SelectionProps) => {
  // 调试信息
  console.log("Selection组件数据:", {
    players,
    playerActions,
    currentRound,
    playerName,
  });

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 顶部布局：左上角阶段，右上角用户名 */}
      <div className="flex justify-between items-start pt-4 pb-6">
        {/* 左上角：阶段 */}
        <div
          className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={onShowEventModal}
        >
          第{currentRound}阶段（点击查看剧情）
        </div>

        {/* 倒计时 */}
        <div className="text-white text-xs font-normal font-['Space_Grotesk']">
          {selectionTimeLeft > 0 ? selectionTimeLeft + "s" : "请您做出选择"}
        </div>
      </div>
      {/* 所有玩家选择状态 */}
      {players && players.length > 0 && (
        <div className="mb-8">
          {/* 玩家状态 */}
          <div className="flex justify-center">
            <div className="flex gap-6">
              {/* 将玩家按当前玩家优先排序 */}
              {[...players]
                .sort((a, b) => {
                  const aIsCurrent = a.name === playerName;
                  const bIsCurrent = b.name === playerName;
                  if (aIsCurrent && !bIsCurrent) return -1;
                  if (!aIsCurrent && bIsCurrent) return 1;
                  return 0;
                })
                .map((player) => {
                  const hasPlayerSubmitted = playerActions?.some(
                    (action) =>
                      action.playerName === player.name &&
                      action.round === currentRound
                  );
                  const isCurrentPlayer = player.name === playerName;

                  console.log(
                    `玩家 ${player.name} 提交状态:`,
                    hasPlayerSubmitted,
                    {
                      playerActions,
                      currentRound,
                      playerName: player.name,
                      isCurrentPlayer,
                      matchingActions: playerActions?.filter(
                        (action) => action.playerName === player.name
                      ),
                      allPlayerNames: playerActions?.map(
                        (action) => action.playerName
                      ),
                      actionRounds: playerActions?.map(
                        (action) => action.round
                      ),
                    }
                  );

                  return (
                    <PlayerStatusCard
                      key={player.name}
                      player={player}
                      isCurrentPlayer={isCurrentPlayer}
                      hasSubmitted={hasPlayerSubmitted}
                      getRoleImage={getRoleImage}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 私人信息 - 全宽度，用户头像在右上角 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div className="px-4 mb-6 relative">
          <div
            className="relative cursor-pointer hover:scale-105 transition-transform duration-200 max-w-sm mx-auto"
            onClick={onShowPrivateModal}
          >
            <img className="w-full h-40" src="./paper.png" alt="私人信息" />
            <div className="absolute inset-0 flex flex-col justify-center items-start px-6 py-4">
              {/* 顶部提示文字 */}
              <div className="opacity-60 text-neutral-600 text-xs font-normal font-['Cactus_Classical_Serif'] uppercase leading-none mb-2 text-start">
                仅你可见，点击可以展开
              </div>

              {/* 主要内容区域 */}
              <div className="flex-1 flex items-center justify-center w-full">
                <div className="text-center text-zinc-800 text-md font-normal font-['Cactus_Classical_Serif'] [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)] leading-relaxed max-w-full overflow-hidden">
                  <div className="line-clamp-4 px-1">
                    {privateMessages[String(playerRole).toUpperCase()]}
                  </div>
                </div>
              </div>

              {/* 底部印章区域 - 确保不与内容重叠 */}
              <div className="absolute bottom-3 right-3 flex items-center">
                <img className="w-5 h-5" src="./print.png" alt="印章" />
                <div className="ml-1 text-gray-200 text-xs font-normal font-['FZLanTingHeiS-H-GB'] [text-shadow:_1px_1px_1px_rgb(103_43_43_/_0.57)]">
                  秘
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 选择提示 */}
      <div className="text-center mb-8">
        <div className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
          请做出你的选择
        </div>
      </div>

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
      </div>
    </div>
  );
};
