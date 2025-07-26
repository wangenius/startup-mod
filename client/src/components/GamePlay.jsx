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
    <div className="w-96 h-[874px] bg-stone-950 overflow-hidden flex flex-col">
      {/* 顶部玩家信息区域 */}
      <div className="flex justify-center pt-8 pb-4">
        <div className="relative">
          <div className="w-20 h-20 absolute left-[55px] top-[36px] bg-gray-200/50 blur-[50px]" />
          <img
            className="w-40 h-40"
            src={getRoleImage(playerRole)}
            alt="Player Avatar"
          />
          <div className="absolute bottom-0 right-0 text-right text-white text-sm font-normal font-['Space_Grotesk'] bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
            <div>{playerName}</div>
            <div className="text-xs opacity-80">{playerRole}</div>
          </div>
        </div>
      </div>

      {/* 事件信息区域 */}
      <div className="flex-1 px-8 py-6">
        <div className="bg-gradient-to-b from-stone-800/50 to-stone-900/50 rounded-xl p-6 border border-stone-700/50 backdrop-blur-sm">
          <div className="text-center mb-4">
            <div 
              className="inline-block px-4 py-2 bg-amber-600/20 rounded-full border border-amber-500/30 cursor-pointer hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-200"
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
      <div className="h-20 flex items-center justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-stone-600 to-transparent rounded-full"></div>
      </div>
    </div>
  );

  // 2. 展示信息和选项阶段
  const renderInfoAndOptions = () => (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="w-40 h-40 left-[201px] top-[33px] absolute">
        <div className="w-20 h-20 left-[55px] top-[36px] absolute bg-gray-200/50 blur-[50px]" />
        <img
          className="w-40 h-40 left-0 top-0 absolute"
          src={getRoleImage(playerRole)}
        />
        <div className="w-16 h-10 left-[92px] top-[122px] absolute text-right justify-start text-white text-sm font-normal font-['Space_Grotesk']">
          {playerName}
          <br />
          {playerRole}
          <br />
        </div>
      </div>
      <div 
        className="left-[39px] top-[88px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => setShowEventModal(true)}
      >
        第{currentRound}阶段
        <br />
      </div>
      <div className="left-[93px] top-[424px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
        请在和团队讨论后做出选择
      </div>

      {/* 私人信息 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div 
          className="w-80 h-44 left-[38px] top-[198px] absolute cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setShowPrivateModal(true)}
        >
          <img
            className="w-full left-[-2px] top-0 absolute"
            src="./paper.png"
          />
          <div className="w-80 left-[7px] top-[73px] absolute text-center justify-start text-zinc-800 text-lg font-normal font-['Cactus_Classical_Serif'] leading-normal [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)] overflow-hidden">
            <div className="line-clamp-3">
              {privateMessages[String(playerRole).toUpperCase()]}
            </div>
          </div>
          <div className="top-[30.22px] absolute opacity-60 justify-start text-neutral-600 text-base font-normal font-['Cactus_Classical_Serif'] uppercase">
            仅你可见，点击可以展开
          </div>
          <img
            className="w-9 h-9 left-[274px] top-[135px] absolute"
            src="./print.png"
          />
          <div className="left-[281.92px] top-[145.89px] absolute origin-top-left rotate-[-10.27deg] text-center justify-start text-gray-200 text-lg font-normal font-['FZLanTingHeiS-H-GB'] leading-normal [text-shadow:_1px_1px_1px_rgb(103_43_43_/_0.57)]">
            秘
          </div>
        </div>
      )}

      {/* 选项展示 */}
      <div className="w-80 left-[36px] top-[472px] absolute inline-flex flex-col justify-start items-start gap-4">
        {roundEvent?.decision_options ? (
          Object.entries(roundEvent.decision_options).map(([key, action]) => (
            <div
              key={key}
              className="self-stretch h-16 px-10 py-2.5 relative bg-neutral-700 rounded-md flex flex-col justify-center items-center gap-2.5 overflow-hidden"
            >
              <div className="w-64 text-center justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight">
                {key}.{action}
              </div>
            </div>
          ))
        ) : (
          <div className="text-white text-center">选项加载中...</div>
        )}
      </div>

      <div
        className="w-24 h-16 left-[153px] top-[763px] absolute cursor-pointer"
        onClick={goToSelection}
      >
        <div className="left-0 top-[46px] absolute text-center justify-start text-white/70 text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          进入讨论
        </div>
        <div className="w-10 h-10 left-[26px] top-0 absolute bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-500 overflow-hidden">
          <div className="w-5 h-5 left-[10px] top-[10px] absolute overflow-hidden">
            <div className="w-4 h-3 left-[1.48px] top-[3.63px] absolute bg-gray-200" />
            <div className="w-1.5 h-1.5 left-[6.48px] top-[6.56px] absolute bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );

  // 3. 讨论环节
  const renderDiscussion = () => (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="w-10 h-10 left-[337px] top-[792px] absolute rounded-full border border-white" />
      <div className="left-[341px] top-[800px] absolute text-center justify-start text-white text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        {discussionTimeLeft}s
      </div>

      <div className="left-[131px] top-[114px] absolute opacity-60 text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal">
        开会时间
        <br />
        请轮流发表意见
      </div>

      <img
        className="w-96 h-64 left-[-14px] top-[428px] absolute"
        src="./askAI.png"
      />
      <button
        onClick={() => setCurrentPhase(GAME_PHASES.SELECTION)}
        className="w-full text-white py-3 px-4 rounded-lg absolute bottom-[100px] mx-auto font-medium"
      >
        进入选择阶段
      </button>
    </div>
  );

  // 4. 选择确认阶段
  const renderSelection = () => (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="left-[136px] top-[426px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
        请做出{playerRole}的选择
      </div>

      <div className="w-80 left-[35px] top-[480px] absolute inline-flex flex-col justify-start items-start gap-4">
        {roundEvent?.decision_options ? (
          Object.entries(roundEvent.decision_options).map(([key, action]) => (
            <div
              key={key}
              className={`self-stretch h-16 px-10 py-2.5 relative rounded-md flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer transition-all ${
                selectedAction === key ? "bg-white" : "bg-neutral-700"
              }`}
              onClick={() => setSelectedAction(key)}
            >
              <div
                className={`w-64 text-center justify-start text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight relative z-10 ${
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

      <div className="w-10 h-10 left-[340px] top-[784px] absolute rounded-full border border-white" />
      <div className="left-[349px] top-[792px] absolute text-center justify-start text-white text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        {selectionTimeLeft}s
      </div>

      <div className="w-40 h-40 left-[201px] top-[33px] absolute">
        <div className="w-20 h-20 left-[55px] top-[36px] absolute bg-gray-200/50 blur-[50px]" />
        <img
          className="w-40 h-40 left-0 top-0 absolute"
          src={getRoleImage(playerRole)}
        />
        <div className="w-16 h-10 left-[92px] top-[122px] absolute text-right justify-start text-white text-sm font-normal font-['Space_Grotesk']">
          {playerName}
          <br />
          {playerRole}
          <br />
        </div>
      </div>

      {/* 私人信息 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div 
          className="w-80 h-44 left-[38px] top-[198px] absolute cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setShowPrivateModal(true)}
        >
          <img className="left-[-2px] top-0 absolute" src="./paper.png" />
          <div className="w-80 left-[7px] top-[73px] absolute text-center justify-start text-zinc-800 text-lg font-normal font-['Cactus_Classical_Serif'] [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)] overflow-hidden">
            <div className="line-clamp-3 px-2">
              {privateMessages[String(playerRole).toUpperCase()]}
            </div>
          </div>
          <div className="left-[20.71px] top-[30.22px] absolute opacity-60 justify-start text-neutral-600 text-base font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
            仅你可见，点击可以展开
          </div>
          <img
            className="w-9 h-9 left-[274px] top-[135px] absolute"
            src="./print.png"
          />
          <div className="left-[281.92px] top-[145.89px] absolute origin-top-left rotate-[-10.27deg] text-center justify-start text-gray-200 text-lg font-normal font-['FZLanTingHeiS-H-GB'] leading-normal [text-shadow:_1px_1px_1px_rgb(103_43_43_/_0.57)]">
            秘
          </div>
        </div>
      )}

      <div 
        className="left-[39px] top-[88px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => setShowEventModal(true)}
      >
        第{currentRound}阶段
        <br />
      </div>

      {!hasSubmitted ? (
        <div className="p-1.5 left-[117px] top-[757px] absolute bg-zinc-300/80 rounded-[20px] shadow-[0px_1.5px_0px_0px_rgba(255,255,255,0.10)] shadow-[inset_0px_0px_2px_0px_rgba(0,0,0,0.08)] inline-flex justify-start items-start gap-2.5">
          <div
            className="px-14 py-5 rounded-2xl shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[0px_6.650102138519287px_5.32008171081543px_0px_rgba(0,0,0,0.13)] shadow-[0px_12.521552085876465px_10.017241477966309px_0px_rgba(0,0,0,0.14)] shadow-[0px_22.3363094329834px_17.869047164916992px_0px_rgba(0,0,0,0.14)] shadow-[0px_41.777610778808594px_33.422088623046875px_0px_rgba(0,0,0,0.15)] shadow-[0px_100px_80px_0px_rgba(0,0,0,0.15)] shadow-[0px_3px_3px_0px_rgba(0,0,0,0.14)] shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[inset_0px_-3px_0px_0px_rgba(8,8,8,1.00)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.30)] flex justify-center items-center gap-5 overflow-hidden cursor-pointer"
            onClick={handleSubmitAction}
          >
            <div className="text-center justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-none">
              确认
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-[100px] left-[48px] w-80 text-center">
          <div className="text-green-400 text-xl font-bold mb-2">
            ✅ 已提交选择
          </div>
          <div className="text-white">等待其他玩家...</div>
        </div>
      )}
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
