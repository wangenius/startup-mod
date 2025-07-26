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
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="w-64 h-7 left-[36px] top-[357px] absolute">
            <div className="left-[8px] top-[2px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入用户名"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-1.5 left-[117px] top-[710px] absolute bg-zinc-300/80 rounded-[20px] shadow-[0px_1.5px_0px_0px_rgba(255,255,255,0.10)] shadow-[inset_0px_0px_2px_0px_rgba(0,0,0,0.08)] inline-flex justify-start items-start gap-2.5">
          <div className="px-14 py-5 rounded-2xl shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[0px_6.650102138519287px_5.32008171081543px_0px_rgba(0,0,0,0.13)] shadow-[0px_12.521552085876465px_10.017241477966309px_0px_rgba(0,0,0,0.14)] shadow-[0px_22.3363094329834px_17.869047164916992px_0px_rgba(0,0,0,0.14)] shadow-[0px_41.777610778808594px_33.422088623046875px_0px_rgba(0,0,0,0.15)] shadow-[0px_100px_80px_0px_rgba(0,0,0,0.15)] shadow-[0px_3px_3px_0px_rgba(0,0,0,0.14)] shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[inset_0px_-3px_0px_0px_rgba(8,8,8,1.00)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.30)] flex justify-center items-center gap-5 overflow-hidden">
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="text-center justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-none"
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
