import { useState, useEffect } from "react";

// 游戏阶段枚举
const GAME_PHASES = {
  EVENT_DISPLAY: "event_display", // 1. 展示事件
  INFO_AND_OPTIONS: "info_and_options", // 2. 展示信息和选项
  DISCUSSION: "discussion", // 3. 讨论环节
  SELECTION: "selection", // 4. 选择确认
};

function GamePlay({
  gameState,
  playerName,
  currentRound,
  roundEvent,
  privateMessages,
  onActionSubmit,
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.EVENT_DISPLAY);
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(120); // 讨论时间120秒
  const [selectionTimeLeft, setSelectionTimeLeft] = useState(20); // 选择时间20秒
  const [showPrivateModal, setShowPrivateModal] = useState(false); // 控制私人信息模态框显示
  const [showEventModal, setShowEventModal] = useState(false); // 控制事件详情模态框显示

  // 根据角色名称确定对应的图片
  const getRoleImage = (role) => {
    const roleImageMap = {
      "CEO": "/image (2).png",
      "CTO": "/image (3).png",
      "CMO": "/image (4).png",
      "COO": "/image (1).png",
      "CPO": "/image (5).png",
    };
    return roleImageMap[role.toUpperCase()] || "/image (2).png"; // 默认使用CEO图片
  };

  console.log(roundEvent);

  useEffect(() => {
    // 重置提交状态当新一轮开始时
    setHasSubmitted(false);
    setSelectedAction("");
    setCurrentPhase(GAME_PHASES.EVENT_DISPLAY);
    setDiscussionTimeLeft(120);
    setSelectionTimeLeft(20);
  }, [currentRound]);

  // 阶段自动切换逻辑
  useEffect(() => {
    let timer;

    if (currentPhase === GAME_PHASES.EVENT_DISPLAY) {
      // 事件展示阶段，3秒后自动切换到信息和选项阶段
      timer = setTimeout(() => {
        setCurrentPhase(GAME_PHASES.INFO_AND_OPTIONS);
      }, 10000);
    } else if (currentPhase === GAME_PHASES.INFO_AND_OPTIONS) {
      // 信息和选项阶段，5秒后自动切换到讨论阶段
      timer = setTimeout(() => {
        setCurrentPhase(GAME_PHASES.DISCUSSION);
      }, 20000);
    }

    return () => clearTimeout(timer);
  }, [currentPhase]);

  // 讨论阶段倒计时
  useEffect(() => {
    let timer;

    if (currentPhase === GAME_PHASES.DISCUSSION && discussionTimeLeft > 0) {
      timer = setTimeout(() => {
        setDiscussionTimeLeft((prev) => {
          if (prev <= 1) {
            setCurrentPhase(GAME_PHASES.SELECTION);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [currentPhase, discussionTimeLeft]);

  // 选择阶段倒计时
  useEffect(() => {
    let timer;

    if (currentPhase === GAME_PHASES.SELECTION && selectionTimeLeft > 0) {
      timer = setTimeout(() => {
        setSelectionTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [currentPhase, selectionTimeLeft]);

  // 手动切换到选择阶段
  const goToSelection = () => {
    setCurrentPhase(GAME_PHASES.SELECTION);
  };

  const handleSubmitAction = () => {
    if (selectedAction) {
      onActionSubmit({
        action: selectedAction,
        reason: "",
      });
      setHasSubmitted(true);
    }
  };

  const currentPlayer = gameState.players?.find((p) => p.name === playerName);
  const playerRole = currentPlayer?.role;

  // 渲染不同阶段的组件
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case GAME_PHASES.EVENT_DISPLAY:
        return renderEventDisplay();
      case GAME_PHASES.INFO_AND_OPTIONS:
        return renderInfoAndOptions();
      case GAME_PHASES.DISCUSSION:
        return renderDiscussion();
      case GAME_PHASES.SELECTION:
        return renderSelection();
      default:
        return renderEventDisplay();
    }
  };

  // 1. 展示事件阶段
  const renderEventDisplay = () => (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 顶部玩家信息区域 */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="relative">
          <div className="w-16 h-16 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200/50 blur-[30px]" />
          <img
            className="w-32 h-32 relative z-10"
            src={getRoleImage(playerRole)}
            alt="Player Avatar"
          />
          <div className="absolute -bottom-2 -right-2 text-right text-white text-sm font-normal font-['Space_Grotesk'] bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="font-medium">{playerName}</div>
            <div className="text-xs opacity-80">{playerRole}</div>
          </div>
        </div>
      </div>

      {/* 事件信息区域 */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-gradient-to-b from-stone-800/50 to-stone-900/50 rounded-xl p-6 border border-stone-700/50 backdrop-blur-sm max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div 
              className="inline-block px-6 py-3 bg-amber-600/20 rounded-full border border-amber-500/30 cursor-pointer hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-200"
              onClick={() => setShowEventModal(true)}
            >
              <span className="text-amber-300 text-lg font-normal font-['Cactus_Classical_Serif'] uppercase">
                第{currentRound}阶段
              </span>
            </div>
          </div>

          <div className="text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-relaxed text-center">
            {roundEvent?.event_description || (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>事件加载中...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="h-16 flex items-center justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-stone-600 to-transparent rounded-full"></div>
      </div>
    </div>
  );

  // 2. 展示信息和选项阶段
  const renderInfoAndOptions = () => (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 顶部玩家信息和阶段标题 */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="relative mb-4">
          <div className="w-16 h-16 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200/50 blur-[30px]" />
          <img
            className="w-32 h-32 relative z-10"
            src={getRoleImage(playerRole)}
            alt="Player Avatar"
          />
          <div className="absolute -bottom-2 -right-2 text-right text-white text-sm font-normal font-['Space_Grotesk'] bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="font-medium">{playerName}</div>
            <div className="text-xs opacity-80">{playerRole}</div>
          </div>
        </div>
        
        <div 
          className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => setShowEventModal(true)}
        >
          第{currentRound}阶段
        </div>
      </div>

      {/* 私人信息 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div className="px-4 mb-6">
          <div 
            className="relative cursor-pointer hover:scale-105 transition-transform duration-200 max-w-sm mx-auto"
            onClick={() => setShowPrivateModal(true)}
          >
            <img
              className="w-full"
              src="./paper.png"
              alt="私人信息"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
              <div className="text-neutral-600 text-sm font-normal font-['Cactus_Classical_Serif'] uppercase mb-2 opacity-60">
                仅你可见，点击可以展开
              </div>
              <div className="text-zinc-800 text-base font-normal font-['Cactus_Classical_Serif'] text-center line-clamp-3">
                {privateMessages[String(playerRole).toUpperCase()]}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <img className="w-6 h-6" src="./print.png" alt="印章" />
                <div className="text-gray-200 text-sm font-normal transform -rotate-12">秘</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提示文字 */}
      <div className="text-center mb-6">
        <div className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase">
          请在和团队讨论后做出选择
        </div>
      </div>

      {/* 选项展示 */}
      <div className="flex-1 px-4">
        <div className="max-w-sm mx-auto space-y-4">
          {roundEvent?.decision_options ? (
            Object.entries(roundEvent.decision_options).map(([key, action]) => (
              <div
                key={key}
                className="w-full h-16 px-6 py-3 bg-neutral-700 rounded-lg flex items-center justify-center"
              >
                <div className="text-white text-lg font-normal font-['Cactus_Classical_Serif'] text-center">
                  {key}. {action}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center">选项加载中...</div>
          )}
        </div>
      </div>

      {/* 进入讨论按钮 */}
      <div className="flex flex-col items-center pb-8">
        <div
          className="cursor-pointer flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={goToSelection}
        >
          <div className="w-10 h-10 bg-zinc-900 rounded-lg border border-stone-500 flex items-center justify-center">
            <div className="w-4 h-3 bg-gray-200 rounded-sm" />
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full ml-1" />
          </div>
          <div className="text-white/70 text-base font-normal font-['Cactus_Classical_Serif']">
            进入讨论
          </div>
        </div>
      </div>
    </div>
  );

  // 3. 讨论环节
  const renderDiscussion = () => (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 标题区域 */}
      <div className="text-center pt-8 pb-6">
        <div className="opacity-60 text-white text-xl font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal">
          开会时间
          <br />
          请轮流发表意见
        </div>
      </div>

      {/* 中间讨论图片区域 */}
      <div className="flex-1 flex items-center justify-center px-4">
        <img
          className="w-full max-w-sm h-auto"
          src="./askAI.png"
          alt="讨论场景"
        />
      </div>

      {/* 底部按钮和倒计时 */}
      <div className="flex flex-col items-center pb-8 space-y-4">
        <button
          onClick={() => setCurrentPhase(GAME_PHASES.SELECTION)}
          className="px-8 py-3 bg-gradient-to-b from-zinc-700 to-zinc-800 text-white rounded-lg font-medium hover:from-zinc-600 hover:to-zinc-700 transition-all duration-200"
        >
          进入选择阶段
        </button>
        
        {/* 倒计时 */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
            <span className="text-white text-base font-normal font-['Cactus_Classical_Serif']">
              {discussionTimeLeft}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. 选择确认阶段
  const renderSelection = () => (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col p-4">
      {/* 顶部玩家信息 */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-gray-200/50 blur-[50px] absolute top-9 left-14" />
          <img
            className="w-32 h-32 relative z-10"
            src={getRoleImage(playerRole)}
            alt={playerRole}
          />
          <div className="text-center text-white text-sm font-normal font-['Space_Grotesk'] mt-2">
            {playerName}
            <br />
            {playerRole}
          </div>
        </div>
        
        <div 
          className="opacity-60 text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-4"
          onClick={() => setShowEventModal(true)}
        >
          第{currentRound}阶段
        </div>
      </div>

      {/* 私人信息 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div className="px-4 mb-6">
          <div 
            className="relative cursor-pointer hover:scale-105 transition-transform duration-200 max-w-sm mx-auto"
            onClick={() => setShowPrivateModal(true)}
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
                onClick={() => setSelectedAction(key)}
              >
                <div
                  className={`text-center text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight ${
                    selectedAction === key ? "text-black" : "text-white"
                  }`}
                >
                  {key}.{action}
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
          <button
            className="px-14 py-5 bg-zinc-300/80 rounded-2xl text-white text-lg font-normal font-['Cactus_Classical_Serif'] hover:bg-zinc-300/90 transition-all duration-200 shadow-lg"
            onClick={handleSubmitAction}
          >
            确认
          </button>
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

  // 事件详情模态框组件
  const renderEventModal = () => {
    if (!showEventModal || !roundEvent) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <div className="w-96 h-[874px] bg-stone-950 overflow-hidden relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 to-stone-950"></div>
          
          {/* 关闭按钮 */}
          <button 
            className="absolute top-6 right-6 w-10 h-10 bg-stone-800/80 rounded-full border border-stone-600 flex items-center justify-center text-white hover:text-amber-300 hover:border-amber-500 transition-all duration-200 z-10"
            onClick={() => setShowEventModal(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 标题区域 */}
          <div className="text-center pt-16 pb-8">
            <div className="inline-block px-6 py-3 bg-amber-600/20 rounded-full border border-amber-500/40 backdrop-blur-sm">
              <span className="text-amber-300 text-xl font-normal font-['Cactus_Classical_Serif'] uppercase tracking-wider">
                第{currentRound}阶段详情
              </span>
            </div>
            <div className="text-stone-400 text-sm mt-2 font-['Cactus_Classical_Serif']">事件详细描述</div>
          </div>

          {/* 事件详情内容区域 */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/80 rounded-xl p-6 border border-stone-700/50 backdrop-blur-sm relative overflow-hidden">
              {/* 装饰性背景图案 */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className="w-full h-full bg-amber-400/10 rounded-full blur-xl"></div>
              </div>
              
              {/* 内容 */}
              <div className="relative z-10">
                <div className="text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-relaxed text-center mb-6">
                  {roundEvent.event_description}
                </div>
                
                {/* 底部装饰线 */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500/50"></div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-['Cactus_Classical_Serif'] uppercase tracking-widest">事件</span>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500/50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="text-stone-500 text-sm font-['Cactus_Classical_Serif']">
              点击右上角关闭按钮返回游戏
            </div>
          </div>

          {/* 边框装饰 */}
          <div className="absolute inset-0 border border-amber-500/20 rounded-lg pointer-events-none"></div>
        </div>
      </div>
    );
  };

  // 私人信息模态框组件
  const renderPrivateModal = () => {
    if (!showPrivateModal || !privateMessages || !privateMessages[String(playerRole).toUpperCase()]) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <div className="w-96 h-[874px] bg-stone-950 overflow-hidden relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 to-stone-950"></div>
          
          {/* 关闭按钮 */}
          <button 
            className="absolute top-6 right-6 w-10 h-10 bg-stone-800/80 rounded-full border border-stone-600 flex items-center justify-center text-white hover:text-amber-300 hover:border-amber-500 transition-all duration-200 z-10"
            onClick={() => setShowPrivateModal(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 顶部玩家信息区域 */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="relative">
              <div className="w-20 h-20 absolute left-[55px] top-[36px] bg-amber-400/20 blur-[50px]"></div>
              <img
                className="w-40 h-40"
                src={getRoleImage(playerRole)}
                alt="Player Avatar"
              />
              <div className="absolute bottom-0 right-0 text-right text-white text-sm font-normal font-['Space_Grotesk'] bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-amber-500/30">
                <div className="text-amber-300 font-semibold">{playerName}</div>
                <div className="text-xs opacity-80">{playerRole}</div>
              </div>
            </div>
          </div>

          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-3 bg-amber-600/20 rounded-full border border-amber-500/40 backdrop-blur-sm">
              <span className="text-amber-300 text-xl font-normal font-['Cactus_Classical_Serif'] uppercase tracking-wider">
                机密信息
              </span>
            </div>
            <div className="text-stone-400 text-sm mt-2 font-['Cactus_Classical_Serif']">只有 {playerRole} 可以查看</div>
          </div>

          {/* 私人信息内容区域 */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/80 rounded-xl p-6 border border-stone-700/50 backdrop-blur-sm relative overflow-hidden">
              {/* 装饰性背景图案 */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img src="./print.png" alt="" className="w-full h-full object-contain" />
              </div>
              
              {/* 内容 */}
              <div className="relative z-10">
                <div className="text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-relaxed text-center mb-6">
                  {privateMessages[String(playerRole).toUpperCase()]}
                </div>
                
                {/* 底部装饰线 */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500/50"></div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-['Cactus_Classical_Serif'] uppercase tracking-widest">机密</span>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500/50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="text-stone-500 text-sm font-['Cactus_Classical_Serif']">
              点击右上角关闭按钮返回游戏
            </div>
          </div>

          {/* 边框装饰 */}
          <div className="absolute inset-0 border border-amber-500/20 rounded-lg pointer-events-none"></div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderPhaseContent()}
      {renderPrivateModal()}
      {renderEventModal()}
    </>
  );
}

export default GamePlay;
