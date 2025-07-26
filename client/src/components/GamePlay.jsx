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
  playerActions,
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.EVENT_DISPLAY);
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(120); // 讨论时间120秒
  const [selectionTimeLeft, setSelectionTimeLeft] = useState(20); // 选择时间20秒

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
      }, 3000);
    } else if (currentPhase === GAME_PHASES.INFO_AND_OPTIONS) {
      // 信息和选项阶段，5秒后自动切换到讨论阶段
      timer = setTimeout(() => {
        setCurrentPhase(GAME_PHASES.DISCUSSION);
      }, 5000);
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
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="w-40 h-40 left-[201px] top-[33px] absolute">
        <div className="w-20 h-20 left-[55px] top-[36px] absolute bg-gray-200/50 blur-[50px]" />
        <img
          className="w-40 h-40 left-0 top-0 absolute"
          src="./image (1).png"
        />
        <div className="w-16 h-10 left-[92px] top-[122px] absolute text-right justify-start text-white text-sm font-normal font-['Space_Grotesk']">
          {playerName}
          <br />
          {playerRole}
          <br />
        </div>
      </div>
      <div className="left-[39px] top-[88px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal">
        第{currentRound}阶段
        <br />
        {roundEvent?.event_description || "事件加载中..."}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          事件展示中...
        </div>
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
          src="./image (1).png"
        />
        <div className="w-16 h-10 left-[92px] top-[122px] absolute text-right justify-start text-white text-sm font-normal font-['Space_Grotesk']">
          {playerName}
          <br />
          {playerRole}
          <br />
        </div>
      </div>
      <div className="left-[39px] top-[88px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal">
        第{currentRound}阶段
        <br />
        {roundEvent?.event_description}
      </div>
      <div className="left-[93px] top-[424px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
        请在和团队讨论后做出选择
      </div>

      {/* 私人信息 */}
      {privateMessages && privateMessages[String(playerRole).toUpperCase()] && (
        <div className="w-80 h-44 left-[38px] top-[198px] absolute">
          <img
            className="w-full left-[-2px] top-0 absolute"
            src="./paper.png"
          />
          <div className="w-80 left-[7px] top-[73px] absolute text-center justify-start text-zinc-800 text-lg font-normal font-['Cactus_Classical_Serif'] leading-normal [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)]">
            {privateMessages[String(playerRole).toUpperCase()]}
          </div>
          <div className="left-[68.71px] top-[30.22px] absolute opacity-60 justify-start text-neutral-600 text-base font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
            你的信息 只有你可以看见
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
      <div className="w-80 left-[36px] top-[472px] absolute inline-flex flex-col justify-start items-start gap-5">
        {roundEvent?.decision_options ? (
          Object.entries(roundEvent.decision_options).map(([key, action]) => (
            <div
              key={key}
              className="self-stretch h-16 px-10 py-2.5 relative bg-neutral-400 rounded-md flex flex-col justify-center items-center gap-2.5 overflow-hidden"
            >
              <div className="w-80 h-16 left-[1px] top-[1px] absolute bg-neutral-800 rounded-[3px] outline outline-1 outline-offset-[-0.50px]" />
              <div className="w-64 text-center justify-start text-neutral-400 text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight">
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
      <div className="left-[131px] top-[114px] absolute opacity-60 text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
        开会时间
        <br />
        请轮流发表意见
      </div>

      {/* 玩家状态显示 */}
      <div className="absolute top-[300px] left-[48px] w-80">
        {gameState.players?.map((player, index) => {
          const hasSubmittedAction = playerActions?.some(
            (action) => action.player === player.name
          );
          return (
            <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-white">
                  {player.name} {player.name === playerName && "(你)"}
                </div>
                <div
                  className={`text-sm ${
                    hasSubmittedAction ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {hasSubmittedAction ? "✅ 已准备" : "⏳ 讨论中"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-[100px] left-[48px] w-80">
        <button
          onClick={() => setCurrentPhase(GAME_PHASES.SELECTION)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          进入选择阶段
        </button>
      </div>
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
                selectedAction === key ? "bg-white" : "bg-neutral-400"
              }`}
              onClick={() => setSelectedAction(key)}
            >
              <div className="w-80 h-16 left-[1px] top-[1px] absolute bg-neutral-800 rounded-[3px] outline outline-1 outline-offset-[-0.50px]" />
              <div
                className={`w-64 text-center justify-start text-lg font-normal font-['Cactus_Classical_Serif'] leading-tight ${
                  selectedAction === key ? "text-white" : "text-neutral-400"
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
          src="./image (1).png"
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
        <div className="w-80 h-44 left-[38px] top-[198px] absolute">
          <img
            className="w-80 h-44 left-[-2px] top-0 absolute"
            src="./background2.png"
          />
          <div className="w-80 left-[7px] top-[73px] absolute text-center justify-start text-zinc-800 text-lg font-normal font-['Cactus_Classical_Serif'] leading-normal [text-shadow:_1px_1px_2px_rgb(142_142_142_/_0.25)]">
            {privateMessages[String(playerRole).toUpperCase()]}
          </div>
          <div className="left-[68.71px] top-[30.22px] absolute opacity-60 justify-start text-neutral-600 text-base font-normal font-['Cactus_Classical_Serif'] uppercase leading-none">
            你的信息 只有你可以看见
          </div>
          <img
            className="w-9 h-9 left-[274px] top-[135px] absolute"
            src="./paper.png"
          />
          <div className="left-[281.92px] top-[145.89px] absolute origin-top-left rotate-[-10.27deg] text-center justify-start text-gray-200 text-lg font-normal font-['FZLanTingHeiS-H-GB'] leading-normal [text-shadow:_1px_1px_1px_rgb(103_43_43_/_0.57)]">
            秘
          </div>
        </div>
      )}

      <div className="left-[39px] top-[88px] absolute opacity-60 justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] uppercase leading-normal">
        第{currentRound}阶段
        <br />
        {roundEvent?.event_description}
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

  return renderPhaseContent();
}

export default GamePlay;
