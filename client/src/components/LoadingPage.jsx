function LoadingPage({ playerName, roleName }) {
  const displayName = roleName || playerName || "林燃";
  return (
    <div className="w-96 h-[874px] relative bg-black overflow-hidden">
      <div className="w-72 h-48 left-[62px] top-[297px] absolute bg-white/0 blur-lg" />
      <div className="w-24 h-28 left-[159px] top-[630px] absolute">
        <video
          className="w-24 h-24 left-0 top-0 absolute"
          src="/videoExport-2025-07-26@12-08-48.606-540x540@60fps.mp4"
          autoPlay
          loop
          muted
          controls={false}
        />
        <div className="left-[6px] top-[93px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          即将开始
        </div>
      </div>
      <div className="left-[158px] top-[368px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        你是{displayName}
      </div>
      <div className="left-[87px] top-[421px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        你的任务是带领公司
        <br />
        成功上市，估值一千万！
        <br />
      </div>
      <div className="w-72 h-[3px] left-[61px] top-[770px] absolute bg-neutral-400 rounded-[1px]" />
      <div className="w-0.5 h-[3px] left-[61px] top-[770px] absolute bg-slate-300 rounded-[1px]" />
      <img
        className="w-72 h-48 left-[51px] top-[139px] absolute"
        src="/CEO.png"
      />
      <div className="left-[311px] top-[297px] absolute text-right justify-end text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]">
        {displayName}
      </div>
    </div>
  );
}

export default LoadingPage;
