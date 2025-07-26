function LoadingPage({ isHost = false, onStartGame }) {
  return (
    <div className="w-96 h-[874px] relative bg-stone-950 overflow-hidden">
      <img
        className="w-96 h-[536px] left-0 top-0 absolute"
        src="https://placehold.co/402x536"
      />
      <div className="w-80 left-[42px] top-[615px] absolute text-center justify-start text-white text-2xl font-normal font-['Cactus_Classical_Serif'] leading-loose">
        🎯 所有角色已选择完成！
        <br />
        {isHost ? (
          <>
            准备开始游戏吗？
            <br />
            <button 
              onClick={onStartGame}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              开始游戏
            </button>
          </>
        ) : (
          <>
            等待房主开始游戏...
            <br />
            <div className="mt-4 text-lg opacity-75">⏳ 请耐心等待</div>
          </>
        )}
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

export default LoadingPage;
