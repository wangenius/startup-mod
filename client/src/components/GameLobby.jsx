import { useState } from "react";

function GameLobby({ onStartupIdeaSubmit }) {
  const [startupIdea, setStartupIdea] = useState("");
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);

  const handleSubmitIdea = () => {
    if (startupIdea.trim()) {
      onStartupIdeaSubmit(startupIdea.trim());
      setIdeaSubmitted(true);
    }
  };

  const handleRandomGenerate = () => {
    const randomIdeas = [
      "没有，谢谢",
      "基于区块链的数字身份验证系统",
      "虚拟现实教育培训平台",
      "智能家居能源管理系统",
      "社交化的技能学习交换平台",
      "环保材料的3D打印服务",
      "AI辅助的心理健康咨询应用",
    ];
    const randomIdea =
      randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
    setStartupIdea(randomIdea);
  };

  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="w-32 h-7 left-[136px] top-[357px] absolute">
        <div className="left-[8px] top-[2px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          <input
            type="text"
            value={startupIdea}
            onChange={(e) => setStartupIdea(e.target.value)}
            placeholder="你的项目是..."
            className="bg-transparent border-none outline-none text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed placeholder-white w-full"
            disabled={ideaSubmitted}
          />
        </div>
        <div className="w-px h-7 left-0 top-0 absolute bg-zinc-300 animate-pulse" />
      </div>

      <button
        onClick={handleRandomGenerate}
        className="left-[169px] top-[531px] absolute text-center justify-start text-white/70 text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed hover:text-white transition-colors cursor-pointer"
      >
        随机生成
      </button>
      <div className="p-1.5 left-[117px] top-[710px] absolute bg-zinc-300/80 rounded-[20px] shadow-[0px_1.5px_0px_0px_rgba(255,255,255,0.10)] shadow-[inset_0px_0px_2px_0px_rgba(0,0,0,0.08)] inline-flex justify-start items-start gap-2.5">
        <button
          onClick={handleSubmitIdea}
          disabled={!startupIdea.trim() || ideaSubmitted}
          className="px-14 py-5 rounded-2xl shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[0px_6.650102138519287px_5.32008171081543px_0px_rgba(0,0,0,0.13)] shadow-[0px_12.521552085876465px_10.017241477966309px_0px_rgba(0,0,0,0.14)] shadow-[0px_22.3363094329834px_17.869047164916992px_0px_rgba(0,0,0,0.14)] shadow-[0px_41.777610778808594px_33.422088623046875px_0px_rgba(0,0,0,0.15)] shadow-[0px_100px_80px_0px_rgba(0,0,0,0.15)] shadow-[0px_3px_3px_0px_rgba(0,0,0,0.14)] shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[inset_0px_-3px_0px_0px_rgba(8,8,8,1.00)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.30)] flex justify-center items-center gap-5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200/90 transition-colors"
        >
          <div className="text-center justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-none">
            {ideaSubmitted ? "已提交" : "确认"}
          </div>
        </button>
      </div>
      <div className="w-10 h-10 left-[179px] top-[485px] absolute bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-500 overflow-hidden">
        <div className="w-5 h-5 left-[10px] top-[10px] absolute overflow-hidden">
          <div className="w-4 h-4 left-[1.80px] top-[1.80px] absolute bg-white" />
        </div>
      </div>
    </div>
  );
}

export default GameLobby;
