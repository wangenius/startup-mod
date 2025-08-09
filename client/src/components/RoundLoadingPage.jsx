import { useGame } from "../context/GameContextCore";

function RoundLoadingPage() {
  const { currentRound } = useGame();
  return (
    <div className="min-h-screen w-full bg-stone-950 overflow-hidden flex flex-col items-center justify-center p-4">
      <video
        className="w-24 h-24"
        src="/videoExport-2025-07-26@12-08-48.606-540x540@60fps.mp4"
        autoPlay
        loop
        controls={false}
      />
      <p className="text-white text-lg mt-4">公司发展中... 第{currentRound}轮</p>
    </div>
  );
}

export default RoundLoadingPage;
