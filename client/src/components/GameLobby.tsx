import { useState, FormEvent } from "react";
import { Button } from "./Button";
import { useGame } from "../context/GameContextCore";

/**
 * 游戏大厅组件
 * 用户输入创业想法的页面
 */
function GameLobby() {
  const { handleStartupIdeaSubmit } = useGame();
  const handleSubmit = handleStartupIdeaSubmit;
  const [startupIdea, setStartupIdea] = useState<string>("");
  const [ideaSubmitted, setIdeaSubmitted] = useState<boolean>(false);

  /**
   * 处理提交创业想法
   */
  const handleSubmitIdea = (): void => {
    if (startupIdea.trim()) {
      handleSubmit(startupIdea.trim());
      setIdeaSubmitted(true);
    }
  };

  /**
   * 随机生成创业想法
   */
  const handleRandomGenerate = (): void => {
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

  /**
   * 处理文本框输入事件，自动调整高度
   * @param e - 表单事件
   */
  const handleTextareaInput = (e: FormEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
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
              onInput={handleTextareaInput}
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
