import { useState, useEffect } from 'react';

function GameResult() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);

  useEffect(() => {
    // 5秒后开始打印动画
    const startTimer = setTimeout(() => {
      setIsPrinting(true);
    }, 5000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (isPrinting) {
      // 打印动画，3秒内从0到100
      const interval = setInterval(() => {
        setPrintProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2; // 每50ms增加2%
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isPrinting]);

  const handleStartPrint = () => {
    setIsPrinting(true);
  };

  return (
    <div className="relative">
      <PrinterEffect 
        isPrinting={isPrinting} 
        printProgress={printProgress}
        onStartPrint={handleStartPrint}
      />
    </div>
  );
}

function PrinterEffect({ isPrinting, printProgress, onStartPrint }) {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      {/* 打印机背景 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-0">
        <img
          className="w-full max-w-[502px] h-96 object-contain"
          src="./print.png"
          alt="打印机"
        />
      </div>
      
      {/* 顶部装饰背景 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[515px] h-[500px] overflow-hidden opacity-30">
        <img
          className="w-full h-full object-cover mix-blend-lighten"
          src="./background2.png"
          alt="背景装饰"
        />
      </div>

      {/* 初始状态内容 */}
      {!isPrinting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-center text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed mb-8">
            五个月过去了
            <br />
            你们4个人的小团队
          </div>
          
          {/* 手动开始按钮 */}
          <button 
            onClick={onStartPrint}
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            开始打印报告
          </button>
        </div>
      )}

      {/* 打印中的纸张效果 */}
      {isPrinting && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* 打印纸张 */}
          <div 
            className="w-80 bg-gradient-to-b from-gray-200 to-zinc-100 rounded-sm relative transition-all duration-300 ease-out"
            style={{
              height: `${Math.min(printProgress * 6, 600)}px`,
              transform: `translateY(${Math.max(300 - printProgress * 3, 0)}px)`
            }}
          >
            {/* Day1 标签 */}
            {printProgress > 10 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-md flex items-center justify-center animate-fadeIn">
                <span className="text-black text-sm font-normal font-['IdeaFonts_YouQiTi']">
                  Day1
                </span>
              </div>
            )}
            
            {/* 打印内容 - 逐步显示 */}
            <div className="p-6 text-zinc-800 text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed space-y-3 overflow-hidden">
              {printProgress > 20 && (
                <div className="text-center font-semibold text-lg mb-4 animate-slideDown">
                  公司结局
                </div>
              )}
              
              {printProgress > 35 && (
                <div className="animate-slideDown">
                  <div className="font-semibold mb-2 text-sm">公司发展概述</div>
                  <p className="text-sm leading-relaxed">
                    经过两年的艰苦奋斗，智适家居成功跨过了初创阶段的生死线。
                  </p>
                </div>
              )}
              
              {printProgress > 50 && (
                <div className="animate-slideDown">
                  <p className="text-sm leading-relaxed">
                    2027年，公司在资本市场完成了A轮融资，估值突破5亿元人民币，
                    成为国内领先的生成式AI智能家居控制方案提供商。
                  </p>
                </div>
              )}
              
              {printProgress > 65 && (
                <div className="animate-slideDown">
                  <div className="font-semibold mb-2 text-sm">个人结局</div>
                  <div className="font-medium mb-1 text-sm">CEO/Founder：林燃</div>
                  <div className="text-xs text-zinc-700 mb-2">未来3年轨迹</div>
                </div>
              )}
              
              {printProgress > 80 && (
                <div className="animate-slideDown">
                  <p className="text-sm leading-relaxed">
                    凭借卓越的战略眼光和领导力，林燃成功引领智适家居走出初创泥潭，实现资本市场突破。
                    他不仅精通融资运作，还积极推动公司文化建设和国际化扩张。
                  </p>
                </div>
              )}
              
              {printProgress > 95 && (
                <div className="animate-slideDown">
                  <p className="text-sm leading-relaxed">
                    2026年，他被评为"年度创新创业领袖"。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部标题 - 打印完成后显示 */}
      {printProgress >= 100 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-zinc-600 text-2xl font-normal font-['FZLanTingHeiS-H-GB'] leading-loose tracking-[3.84px] z-20 animate-fadeIn">
          创业报告
        </div>
      )}

      {/* 打印进度指示器 */}
      {isPrinting && printProgress < 100 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-30">
          <div className="text-sm mb-1">正在打印... {Math.round(printProgress)}%</div>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-out"
              style={{ width: `${printProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GameResult;
