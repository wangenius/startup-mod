import { useState, useEffect } from "react";
import { useGame } from "../context/GameContextCore";

function GameResult() {
  const { gameResult, handleRestartGame: onRestart } = useGame();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [reportSections, setReportSections] = useState({});

  // 解析最终报告内容
  useEffect(() => {
    if (gameResult?.final_report) {
      const sections = parseMarkdownReport(gameResult.final_report);
      setReportSections(sections);
    }
  }, [gameResult]);

  useEffect(() => {
    // 5秒后开始打印动画
    const startTimer = setTimeout(() => {
      setIsPrinting(true);
    }, 5000);

    return () => clearTimeout(startTimer);
  }, []);

  // 解析markdown格式的报告
  const parseMarkdownReport = (report) => {
    const sections = {};
    const lines = report.split("\n");
    let currentSection = "";
    let currentContent = [];

    for (const line of lines) {
      if (line.startsWith("##") || line.startsWith("#")) {
        // 保存上一个section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n").trim();
        }
        // 开始新section
        currentSection = line.replace(/^#+\s*/, "").trim();
        currentContent = [];
      } else if (line.trim()) {
        currentContent.push(line);
      }
    }

    // 保存最后一个section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join("\n").trim();
    }

    return sections;
  };

  useEffect(() => {
    if (isPrinting) {
      // 打印动画，3秒内从0到100
      const interval = setInterval(() => {
        setPrintProgress((prev) => {
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

  const handleRestart = () => {
    setIsPrinting(false);
    setPrintProgress(0);
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="relative">
      <PrinterEffect
        isPrinting={isPrinting}
        printProgress={printProgress}
        onStartPrint={handleStartPrint}
        onRestart={handleRestart}
        reportSections={reportSections}
        gameResult={gameResult}
      />
    </div>
  );
}

function PrinterEffect({
  isPrinting,
  printProgress,
  onStartPrint,
  onRestart,
  reportSections,
}) {
  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden relative flex flex-col">
      {/* 打印机背景 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-0">
        <img
          className="w-full h-auto object-contain"
          src="./print.png"
          alt="打印机"
        />
      </div>

      {/* 初始状态内容 */}
      {!isPrinting && (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-4">
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
        <div className="flex-1 flex items-center justify-center z-10 p-4">
          {/* 打印纸张 */}
          <div
            className="w-full max-w-sm bg-gradient-to-b from-gray-200 to-zinc-100 rounded-sm relative transition-all duration-300 ease-out mx-auto"
            style={{
              height: `${Math.min(printProgress * 6, 600)}px`,
              transform: `translateY(${Math.max(
                150 - printProgress * 1.5,
                0
              )}px)`,
            }}
          >
            {/* Day1 标签 */}
            {printProgress > 10 && (
              <div className="absolute left-2 top-2 transform w-10 h-10 bg-white rounded-md flex items-center justify-center animate-fadeIn">
                <span className="text-black text-sm font-normal font-['IdeaFonts_YouQiTi']">
                  Day1
                </span>
              </div>
            )}

            {/* 打印内容 - 逐步显示 */}
            <div className="p-6 text-zinc-800 text-base font-normal font-['Cactus_Classical_Serif'] leading-relaxed space-y-3 overflow-y-auto max-h-[500px]">
              {printProgress > 20 && (
                <div className="text-center font-semibold text-lg mb-4 animate-slideDown">
                  创业结局报告
                </div>
              )}

              {printProgress > 35 && reportSections["公司发展概述"] && (
                <div className="animate-slideDown">
                  <div className="font-semibold mb-2 text-sm">公司发展概述</div>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {reportSections["公司发展概述"]
                      .split("\n")
                      .slice(0, 2)
                      .join("\n")}
                  </div>
                </div>
              )}

              {printProgress > 50 && reportSections["公司发展概述"] && (
                <div className="animate-slideDown">
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {reportSections["公司发展概述"]
                      .split("\n")
                      .slice(2)
                      .join("\n")}
                  </div>
                </div>
              )}

              {printProgress > 65 && reportSections["核心成员个人未来故事"] && (
                <div className="animate-slideDown">
                  <div className="font-semibold mb-2 text-sm">
                    核心成员未来故事
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {reportSections["核心成员个人未来故事"]
                      .split("\n")
                      .slice(0, 3)
                      .join("\n")}
                  </div>
                </div>
              )}

              {printProgress > 80 && reportSections["核心成员个人未来故事"] && (
                <div className="animate-slideDown">
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {reportSections["核心成员个人未来故事"]
                      .split("\n")
                      .slice(3, 6)
                      .join("\n")}
                  </div>
                </div>
              )}

              {printProgress > 95 && reportSections["核心成员个人未来故事"] && (
                <div className="animate-slideDown">
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {reportSections["核心成员个人未来故事"]
                      .split("\n")
                      .slice(6)
                      .join("\n")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部标题和重新开始按钮 - 打印完成后显示 */}
      {printProgress >= 100 && (
        <div className="flex flex-col items-center justify-center pb-8 text-center z-20 animate-fadeIn">
          <div className="text-zinc-600 text-2xl font-normal font-['FZLanTingHeiS-H-GB'] leading-loose tracking-[3.84px] mb-4">
            创业报告
          </div>
          <button
            onClick={onRestart}
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-lg"
          >
            重新开始
          </button>
        </div>
      )}

      {/* 打印进度指示器 */}
      {isPrinting && printProgress < 100 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-30">
          <div className="text-sm mb-1">
            正在打印... {Math.round(printProgress)}%
          </div>
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
