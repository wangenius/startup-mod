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
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col justify-center p-6">
      <div className="flex flex-col items-center space-y-8">
        {/* 标题 */}
        <div className="text-white text-xl font-normal font-['Cactus_Classical_Serif'] text-center mb-8">
          输入团队暗号
        </div>

        {/* 输入框区域 */}
        <div className="flex justify-center items-center gap-3">
          {teamCode.map((code, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-20 border border-white/60 bg-transparent text-white text-center text-xl focus:outline-none focus:border-white rounded-lg transition-colors duration-200"
              maxLength={1}
              disabled={loading}
            />
          ))}
        </div>

        {/* 加入房间按钮 */}
        <div className="mt-16">
          <div className="p-1.5 bg-zinc-300/80 rounded-[20px] shadow-lg">
            <button
              onClick={handleJoinRoom}
              disabled={loading || !teamCode.join("").trim()}
              className="px-14 py-5 rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-300 shadow-lg text-white text-lg font-normal font-['Cactus_Classical_Serif'] disabled:opacity-50 disabled:cursor-not-allowed hover:from-zinc-100 hover:to-zinc-200 transition-all duration-200"
            >
              {loading ? "进入中..." : "加入房间"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomManager;
