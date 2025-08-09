interface PrivateInfoProps {
  privateMessages: Record<string, string>;
  playerRole: string;
  onShowPrivateModal: () => void;
}

/**
 * 私人信息纸条组件
 */
export const PrivateInfo = ({ 
  privateMessages, 
  playerRole, 
  onShowPrivateModal 
}: PrivateInfoProps) => {
  if (!privateMessages || !privateMessages[String(playerRole).toUpperCase()]) {
    return null;
  }

  return (
    <div className="px-4 mb-6">
      <div
        className="relative cursor-pointer hover:scale-105 transition-transform duration-200 max-w-sm mx-auto"
        onClick={onShowPrivateModal}
      >
        <img className="w-full" src="./paper.png" alt="私人信息" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
          <div className="text-neutral-600 text-sm font-normal font-['Cactus_Classical_Serif'] uppercase mb-2 opacity-60">
            仅你可见，点击可以展开
          </div>
          <div className="text-zinc-800 text-base font-normal font-['Cactus_Classical_Serif'] text-center line-clamp-3">
            {privateMessages[String(playerRole).toUpperCase()]}
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <img className="w-6 h-6" src="./print.png" alt="印章" />
            <div className="text-gray-200 text-sm font-normal transform -rotate-12">
              秘
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
