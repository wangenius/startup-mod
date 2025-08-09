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
  getRoleImage,
  onShowEventModal,
  onShowPrivateModal,
  onSelectAction,
  onSubmitAction
}: SelectionProps) => {
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
