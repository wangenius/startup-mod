import React from "react";

function GameLoadingPage({ playerName, roleDefinitions }) {
  // 获取当前玩家的角色信息
  const getCurrentPlayerRole = () => {
    if (!roleDefinitions || !playerName) return null;

    // 查找当前玩家选择的角色
    const roles = ["CEO", "CTO", "CMO", "COO"];
    for (const roleId of roles) {
      if (roleDefinitions[roleId]) {
        return {
          id: roleId,
          name: roleDefinitions[roleId].name || roleId,
          description: roleDefinitions[roleId].description || "",
        };
      }
    }
    return null;
  };

  const currentRole = getCurrentPlayerRole();
  const roleName = currentRole ? currentRole.name : playerName;

  return (
    <div className="w-96 h-[874px] relative bg-black overflow-hidden">
      {/* 背景模糊效果 */}
      <div className="w-72 h-48 left-[62px] top-[297px] absolute bg-white/0 blur-lg" />

      {/* 加载动画和"即将开始"文字 */}
      <div className="w-24 h-28 left-[159px] top-[630px] absolute">
        <video
          className="w-24 h-24 left-0 top-0 absolute"
          src="/videoExport-2025-07-26@12-08-48.606-540x540@60fps.mp4"
          autoPlay
          loop
          controls={false}
        />
        <div className="left-[6px] top-[93px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
          即将开始
        </div>
      </div>

      {/* 角色名称 */}
      <div className="left-[158px] top-[368px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        你是{roleName}
      </div>

      {/* 任务描述 */}
      <div className="left-[87px] top-[421px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        你的任务是带领公司
        <br />
        成功上市，估值一千万！
        <br />
      </div>

      {/* 进度条背景 */}
      <div className="w-72 h-[3px] left-[61px] top-[770px] absolute bg-neutral-400 rounded-[1px]" />
      {/* 进度条前景 */}
      <div className="w-0.5 h-[3px] left-[61px] top-[770px] absolute bg-slate-300 rounded-[1px]" />

      {/* CEO角色图片 */}
      <img
        className="w-72 h-48 left-[51px] top-[139px] absolute"
        src="/CEO.png"
      />

      {/* 右上角玩家名称 */}
      <div className="left-[311px] top-[297px] absolute text-right justify-end text-white text-sm font-medium font-['Space_Grotesk'] [text-shadow:_0px_2px_1px_rgb(0_0_0_/_0.25)]">
        {roleName}
      </div>
    </div>
  );
}

export default GameLoadingPage;
