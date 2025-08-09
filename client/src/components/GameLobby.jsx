import { useState } from "react";
import { Button } from "./Button";
import { useGame } from "../context/GameContextCore";

function GameLobby() {
  const { handleStartupIdeaSubmit } = useGame();
  const [startupIdea, setStartupIdea] = useState("");
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);

  const handleSubmitIdea = () => {
    if (startupIdea.trim()) {
      handleStartupIdeaSubmit(startupIdea.trim());
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
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col justify-center p-6">
      <div className="flex flex-col items-center space-y-8">
        {/* 输入区域 */}
        <div className="w-full max-w-sm">
          <div className="relative">
            <div className="w-1 h-8 bg-zinc-300 animate-pulse absolute left-0 top-0" />
            <textarea
              value={startupIdea}
              onChange={(e) => setStartupIdea(e.target.value)}
              placeholder="你的项目是..."
              className="bg-transparent border-none outline-none text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed placeholder-white w-full resize-none overflow-hidden pl-4"
              disabled={ideaSubmitted}
              rows={3}
              style={{
                minHeight: "80px",
                height: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>
        </div>

        {/* 随机生成按钮 */}
        {!startupIdea.trim() && (
          <button
            onClick={handleRandomGenerate}
            className="text-white/70 text-base font-normal font-['Cactus_Classical_Serif'] hover:text-white transition-colors cursor-pointer"
          >
            随机生成
          </button>
        )}

        {/* 确认按钮 */}
        <div className="mt-8">
          <Button
            onClick={handleSubmitIdea}
            disabled={!startupIdea.trim() || ideaSubmitted}
          >
            {ideaSubmitted ? "已提交" : "确认"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GameLobby;
