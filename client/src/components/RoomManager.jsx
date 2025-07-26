import { useState, useRef } from "react";

function RoomManager({ onRoomAction }) {
  const [teamCode, setTeamCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...teamCode];
      newCode[index] = value;
      setTeamCode(newCode);
      
      // 自动聚焦到下一个输入框
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // 处理退格键，自动聚焦到上一个输入框
    if (e.key === 'Backspace' && !teamCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };



  const handleJoinRoom = async () => {
    const code = teamCode.join("");
    if (!code.trim()) return;
    setLoading(true);
    try {
      await onRoomAction("join", code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <div className="left-[63px] top-[398px] absolute inline-flex justify-start items-center gap-3">
        {teamCode.map((code, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-20 border-[0.40px] border-white/60 bg-transparent text-white text-center text-xl focus:outline-none focus:border-white"
            maxLength={1}
            disabled={loading}
          />
        ))}
      </div>
      <div className="left-[139px] top-[347px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        输入团队暗号
      </div>
      <div className="p-1.5 left-[99px] top-[710px] absolute bg-zinc-300/80 rounded-[20px] shadow-[0px_1.5px_0px_0px_rgba(255,255,255,0.10)] shadow-[inset_0px_0px_2px_0px_rgba(0,0,0,0.08)] inline-flex justify-start items-start gap-2.5">
        <button
          onClick={handleJoinRoom}
          disabled={loading || !teamCode.join("").trim()}
          className="px-14 py-5 rounded-2xl shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[0px_6.650102138519287px_5.32008171081543px_0px_rgba(0,0,0,0.13)] shadow-[0px_12.521552085876465px_10.017241477966309px_0px_rgba(0,0,0,0.14)] shadow-[0px_22.3363094329834px_17.869047164916992px_0px_rgba(0,0,0,0.14)] shadow-[0px_41.777610778808594px_33.422088623046875px_0px_rgba(0,0,0,0.15)] shadow-[0px_100px_80px_0px_rgba(0,0,0,0.15)] shadow-[0px_3px_3px_0px_rgba(0,0,0,0.14)] shadow-[0px_2.767256498336792px_2.2138051986694336px_0px_rgba(0,0,0,0.12)] shadow-[inset_0px_-3px_0px_0px_rgba(8,8,8,1.00)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.30)] flex justify-center items-center gap-5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <div className="text-center justify-start text-white text-lg font-normal font-['Cactus_Classical_Serif'] leading-none">
            {loading ? "进入中..." : "加入房间"}
          </div>
        </button>
      </div>

    </div>
  );
}

export default RoomManager;
