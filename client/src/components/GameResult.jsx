import { useState, useEffect } from 'react';

function GameResult() {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 5秒后自动切换到Page2
    const timer = setTimeout(() => {
      setCurrentPage(2);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleNextPage = () => {
    if (currentPage === 1) {
      setCurrentPage(2);
    }
  };

  return (
    <div className="relative">
      {currentPage === 1 && <Page1 />}
      {currentPage === 2 && <Page2 />}
      
      {/* 可选：添加手动切换按钮 */}
      {currentPage === 1 && (
        <button 
          onClick={handleNextPage}
          className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          下一页
        </button>
      )}
    </div>
  );
}

function Page1() {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <img
        className="w-[467px] h-96 left-[-25px] top-[679px] absolute"
        src="./print.png"
      />
      <div className="w-64 h-24 left-[68px] top-[701px] absolute bg-gradient-to-b from-gray-200 to-zinc-100 rounded-[1px]" />
      <div className="left-[131px] top-[831px] absolute text-center justify-start text-zinc-600 text-3xl font-normal font-['FZLanTingHeiS-H-GB'] leading-loose tracking-[3.84px]">
        创业报告
      </div>
      <div className="w-64 left-[86px] top-[337px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        五个月过去了
        <br />
        你们4个人的小团队
        <br />
      </div>
      <div className="w-12 h-12 left-[177px] top-[731px] absolute">
        <div className="w-12 h-12 left-0 top-0 absolute bg-white rounded-lg" />
        <div className="left-[5.79px] top-[16.97px] absolute text-center justify-start text-black text-lg font-normal font-['IdeaFonts_YouQiTi'] leading-3">
          Day1
        </div>
      </div>
    </div>
  );
}
function Page2() {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <img
        className="w-[502px] h-96 left-[-44px] top-[670px] absolute"
        src="./print.png"
      />
      <div className="w-72 h-[725px] left-[56px] top-[79px] absolute bg-gradient-to-b from-gray-200 to-zinc-100 rounded-[1px]" />
      <img
        className="w-[515px] h-[500px] left-[-55px] top-[-80px] absolute mix-blend-lighten"
        src="./background2.png"
      />
      <div className="w-64 left-[74px] top-[144px] absolute text-center justify-start text-zinc-800 text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        公司结局
        <br />
        <br />
        公司发展概述
        <br />
        经过两年的艰苦奋斗智适家居成功跨过了初创阶段的生死线。
        <br />
        2027年，公司在资本市场完成了A轮融资，估值突破5亿元人民币，
        <br />
        成为国内领先的生成式AI智能家居控制方案提供商
        <br />
        <br />
        个人结局
        <br />
        <br />
        CEO/Founder：林燃
        <br />
        未来3年轨迹
        凭借卓越的战略眼光和领导力，林燃成功引领智适家居走出初创泥潭，实现资本市场突破。
        他不仅精通融资运作，还积极推动公司文化建设和国际化扩张。
        2026年，他被评为“年度创新创业领袖”，
        <br />
      </div>
      <div className="left-[131px] top-[831px] absolute text-center justify-start text-zinc-600 text-3xl font-normal font-['FZLanTingHeiS-H-GB'] leading-loose tracking-[3.84px]">
        创业报告
      </div>
      <div className="w-9 h-9 left-[184px] top-[89px] absolute">
        <div className="w-9 h-9 left-0 top-0 absolute bg-white rounded-md" />
        <div className="left-[4.34px] top-[12.72px] absolute text-center justify-start text-black text-sm font-normal font-['IdeaFonts_YouQiTi'] leading-[9.93px]">
          Day1
        </div>
      </div>
    </div>
  );
}
export default GameResult;
