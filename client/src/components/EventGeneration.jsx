import { useState, useEffect } from 'react';

function EventGeneration({ 
  playerName, 
  onStartRound 
}) {
  const [animationPhase, setAnimationPhase] = useState('intro'); // intro, loading, complete
  const [countdown, setCountdown] = useState(5);
  
  // 自动播放过渡动画
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('loading');
    }, 2000); // 2秒后进入加载阶段
    
    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
      // 开始倒计时
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            // 倒计时结束，触发游戏开始
            if (onStartRound) {
              onStartRound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 4000); // 4秒后进入完成阶段
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onStartRound]);

  // 渲染不同阶段的动画
  const renderAnimation = () => {
    switch (animationPhase) {
      case 'intro':
        return (
          <div className="text-center">
            <div className="animate-pulse text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-white mb-2">角色选择完成</h2>
            <p className="text-xl text-gray-300">准备进入游戏世界...</p>
          </div>
        );
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⚡</div>
            <h2 className="text-3xl font-bold text-white mb-2">AI正在生成游戏内容</h2>
            <p className="text-xl text-gray-300">创建独特的创业挑战...</p>
            <div className="mt-4">
              <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="text-center">
            <div className="animate-bounce text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-2">准备就绪</h2>
            <p className="text-xl text-gray-300 mb-4">第一轮挑战即将开始</p>
            <div className="text-4xl font-bold text-yellow-400">
              {countdown > 0 ? countdown : '开始!'}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-96 h-[874px] relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden mx-auto flex items-center justify-center">
      {/* 背景动画效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10 px-8">
        {renderAnimation()}
        
        {/* 玩家信息 */}
        <div className="absolute top-8 right-8 text-right">
          <div className="text-sm text-gray-400">玩家</div>
          <div className="text-lg font-semibold text-white">{playerName}</div>
        </div>
      </div>
    </div>
  );
}

export default EventGeneration;