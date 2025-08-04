import { useState } from "react";

function WelcomePage({ onPlayerNameSet }) {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onPlayerNameSet(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col justify-center p-6">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-8">
        {/* 输入区域 */}
        <div className="w-full max-w-sm">
          <div className="relative">
            <div className="w-1 h-8 bg-zinc-300 animate-pulse absolute left-0 top-0" />
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed placeholder-white w-full pl-4"
              placeholder="输入用户名"
              required
            />
          </div>
        </div>

        {/* 确定按钮 */}
        <div className="mt-16">
          <div className="p-1.5 bg-zinc-300/80 rounded-[20px] shadow-lg">
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="px-14 py-5 rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-300 shadow-lg text-white text-lg font-normal font-['Cactus_Classical_Serif'] disabled:opacity-50 disabled:cursor-not-allowed hover:from-zinc-100 hover:to-zinc-200 transition-all duration-200"
            >
              确定
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default WelcomePage;
