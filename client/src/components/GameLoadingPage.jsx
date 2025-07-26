import React, { useState, useEffect } from "react";

function GameLoadingPage({ playerName, roleDefinitions }) {
  const [currentView, setCurrentView] = useState('loading'); // 'loading', 'video1', 'video2'

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

  useEffect(() => {
    // 2秒后切换到video1
    const timer = setTimeout(() => {
      setCurrentView('video1');
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 处理video1播放结束后切换到video2
  const handleVideo1Ended = () => {
    setCurrentView('video2');
  };

  // 根据当前状态渲染不同的视图
  if (currentView === 'video1') {
    return <Video1 onEnded={handleVideo1Ended} />;
  }
  
  if (currentView === 'video2') {
    return <Video2 />;
  }

  // 默认显示加载页面
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

function Video1({ onEnded }) {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <video
        className="w-96 h-[536px] left-0 top-0 absolute object-cover"
        src="/first scene.mp4"
        autoPlay
        muted
        controls={false}
        onEnded={onEnded}
      />
      <div className="w-80 left-[42px] top-[615px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-loose">
        故事始于一阵短暂而耀眼的黑客松胜利。那是一场持续48小时不眠不休的鏖战，在评委念出他们团队名字的瞬间，一切的疲惫都化作了震耳欲聋的欢呼与香槟泡沫。{" "}
        <br />
      </div>
      <div className="w-96 h-12 left-0 top-0 absolute overflow-hidden">
        <div className="w-6 h-3 left-[360.66px] top-[18.66px] absolute opacity-30 rounded-[2.87px] border-1 border-white" />
        <div className="w-[1.43px] h-1 left-[385.41px] top-[22.60px] absolute opacity-40 bg-white" />
        <div className="w-5 h-2 left-[362.81px] top-[20.81px] absolute bg-white rounded-sm" />
        <div className="w-14 h-6 left-[22.60px] top-[12.92px] absolute rounded-[34.44px]">
          <div className="w-8 h-3 left-[13.40px] top-[5.56px] absolute bg-white" />
        </div>
      </div>
    </div>
  );
}

function Video2() {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <video
        className="w-96 h-[536px] left-0 top-0 absolute object-cover"
        src="/second scene.mp4"
        autoPlay
        muted
        controls={false}
      />
      <div className="w-80 left-[42px] top-[615px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-loose">
        但优胜的甘甜味道很快在舌尖散去。真正的战场，是在深夜的办公间——伴随着速溶咖啡的苦涩和白板上反复修改的草图。团队带着黑客松的奖金，和对未来的憧憬，在这里开始锻造他们的第一个产品原型。
      </div>
      <div className="w-96 h-12 left-0 top-0 absolute overflow-hidden">
        <div className="w-6 h-3 left-[360.66px] top-[18.66px] absolute opacity-30 rounded-[2.87px] border-1 border-white" />
        <div className="w-[1.43px] h-1 left-[385.41px] top-[22.60px] absolute opacity-40 bg-white" />
        <div className="w-5 h-2 left-[362.81px] top-[20.81px] absolute bg-white rounded-sm" />
        <div className="w-14 h-6 left-[22.60px] top-[12.92px] absolute rounded-[34.44px]">
          <div className="w-8 h-3 left-[13.40px] top-[5.56px] absolute bg-white" />
        </div>
      </div>
    </div>
  );
}

export default GameLoadingPage;
