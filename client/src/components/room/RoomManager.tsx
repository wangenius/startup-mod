import { useState, useRef, KeyboardEvent } from "react";
import { useGame } from "../../context/GameContextCore";
import { Button } from "../Button";

/**
 * 房间管理组件
 * 用户输入团队暗号加入房间的页面
 */
function RoomManager() {
  const { handleRoomAction, playerName } = useGame();
  const [teamCode, setTeamCode] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * 处理验证码输入变化
   * @param index - 输入框索引
   * @param value - 输入值
   */
  const handleCodeChange = (index: number, value: string): void => {
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

  /**
   * 处理键盘按键事件
   * @param index - 输入框索引
   * @param e - 键盘事件
   */
  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ): void => {
    // 处理退格键，自动聚焦到上一个输入框
    if (e.key === "Backspace" && !teamCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 处理加入房间
   */
  const handleJoinRoom = async (): Promise<void> => {
    const code = teamCode.join("");
    if (!code.trim()) return;
    setLoading(true);
    try {
      await handleRoomAction("join", code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col justify-center p-6 relative">
      <div className="absolute top-4 right-4 text-right text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]">
        {playerName}
      </div>
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
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
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
          <Button
            onClick={handleJoinRoom}
            disabled={loading || teamCode.join("").trim().length < 4}
          >
            {loading ? "进入中..." : "加入房间"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoomManager;
