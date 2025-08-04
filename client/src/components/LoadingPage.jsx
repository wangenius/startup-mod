function LoadingPage({ playerName, roleName }) {
  const displayName = roleName || playerName || "林燃";

  // 根据角色名称确定对应的图片
  const getRoleImage = (role) => {
    const roleImageMap = {
      CEO: "/image (2).png",
      CTO: "/image (3).png",
      CMO: "/image (4).png",
      COO: "/image (1).png",
      CPO: "/image (1).png",
    };
    return roleImageMap[role.toUpperCase()] || "/image (1).png"; // 默认使用CEO图片
  };
  return (
    <div className="min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center p-4">
      {/* 角色图片区域 */}
      <div className="relative mb-8">
        <div className="w-64 h-40 bg-white/0 blur-lg absolute top-4 left-1/2 transform -translate-x-1/2" />
        <img
          className="w-64 h-40 relative z-10 rounded-lg"
          src={getRoleImage(roleName)}
          alt={roleName}
        />
        <div className="absolute bottom-0 right-0 text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]">
          {displayName}
        </div>
      </div>

      {/* 文字信息区域 */}
      <div className="text-center space-y-4 mb-12">
        <div className="text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          你是{displayName}
        </div>
        <div className="text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          你的任务是带领公司
          <br />
          成功上市，估值一千万！
        </div>
      </div>

      {/* 加载动画区域 */}
      <div className="flex flex-col items-center space-y-4">
        <video
          className="w-24 h-24"
          src="/videoExport-2025-07-26@12-08-48.606-540x540@60fps.mp4"
          autoPlay
          loop
          muted
          controls={false}
        />
        <div className="text-center text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          即将开始
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-xs mt-8">
        <div className="w-full h-[3px] bg-neutral-400 rounded-[1px] relative">
          <div className="w-0.5 h-[3px] bg-slate-300 rounded-[1px] absolute left-0 top-0" />
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
