import { useState, useRef, KeyboardEvent } from "react";
import { useGame } from "../../context/GameContextCore";
import { Button } from "../Button";

/**
 * 房间管理组件
 * 用户输入团队暗号加入房间的页面
 */
function RoomEntrance() {
  const { 
    handleRoomAction, 
    playerName, 
    roomList, 
    loadingRoomList, 
    fetchRoomList 
  } = useGame();
  const [teamCode, setTeamCode] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showRoomList, setShowRoomList] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * 处理快速加入房间
   */
  const handleQuickJoin = async (roomId: string): Promise<void> => {
    setLoading(true);
    try {
      await handleRoomAction("join", roomId);
      setShowRoomList(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理显示房间列表
   */
  const handleShowRoomList = (): void => {
    setShowRoomList(true);
    fetchRoomList();
  };

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

        {/* 查看在线房间按钮 */}
        <div className="mt-6">
          <button
            onClick={handleShowRoomList}
            disabled={loading}
            className="text-white/70 text-base font-normal font-['Cactus_Classical_Serif'] hover:text-white transition-colors cursor-pointer underline"
          >
            查看在线房间
          </button>
        </div>
      </div>

      {/* 房间列表弹窗 */}
      {showRoomList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-lg border border-white/20 w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-white text-xl font-normal font-['Cactus_Classical_Serif']">
                在线房间
              </h2>
              <button
                onClick={() => setShowRoomList(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 房间列表内容 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingRoomList ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white/70 text-base font-normal font-['Cactus_Classical_Serif']">
                    加载中...
                  </div>
                </div>
              ) : roomList.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white/70 text-base font-normal font-['Cactus_Classical_Serif']">
                    暂无在线房间
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomList.map((room) => (
                    <div
                      key={room.room_id}
                      className="bg-stone-800 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white text-lg font-medium font-['Cactus_Classical_Serif']">
                              {room.room_id}
                            </h3>
                            <span className="text-white/60 text-sm">
                              ({room.player_count}/{room.max_players})
                            </span>
                          </div>
                          <div className="text-white/70 text-sm mb-2">
                            状态: {room.game_state === 'lobby' ? '等待中' : '游戏中'}
                          </div>
                          {room.players.length > 0 && (
                            <div className="text-white/60 text-sm">
                              玩家: {room.players.map(p => p.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleQuickJoin(room.room_id)}
                          disabled={loading || room.player_count >= room.max_players}
                          className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                        >
                          {loading ? "进入中..." : room.player_count >= room.max_players ? "已满" : "加入"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 刷新按钮 */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={fetchRoomList}
                disabled={loadingRoomList}
                className="w-full py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white text-sm rounded transition-colors"
              >
                {loadingRoomList ? "刷新中..." : "刷新列表"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomEntrance;
