export function InitialPage({ onClick }) {
  return (
    <div 
      className="w-96 h-[874px] relative bg-stone-950 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      <img
        className="w-48 h-48 left-[171px] top-[672px] absolute"
        src="https://placehold.co/193x193"
      />
      <div className="left-[150px] top-[360px] absolute text-center justify-start text-white text-xl font-normal font-['Cactus_Classical_Serif'] leading-relaxed">
        创业模拟器
      </div>
      <img
        className="w-56 h-56 left-[56px] top-[645px] absolute"
        src="https://placehold.co/230x229"
      />
      <img
        className="w-44 h-44 left-[-11px] top-[702px] absolute"
        src="https://placehold.co/171x171"
      />
      <img
        className="w-36 h-36 left-[301px] top-[722px] absolute"
        src="https://placehold.co/151x151"
      />
      <div className="w-60 left-[127.69px] top-[583px] absolute origin-top-left rotate-[15deg] text-center justify-start text-rose-400 text-2xl font-normal font-['Jamies_Hand'] capitalize leading-snug">
        No pressure
      </div>
      <div className="w-28 h-28 left-[143px] top-[223px] absolute">
        <div className="w-28 h-28 left-0 top-0 absolute bg-white rounded-[20px]" />
        <div className="left-[14px] top-[41px] absolute text-center justify-start text-black text-5xl font-normal font-['IdeaFonts_YouQiTi'] leading-loose">
          Day1
        </div>
      </div>
    </div>
  );
}
