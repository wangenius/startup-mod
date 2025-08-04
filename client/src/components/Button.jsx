export function Button({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-48 h-16 bg-cover bg-no-repeat flex items-center justify-center text-white text-lg font-normal font-['Cactus_Classical_Serif'] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
      style={{
        backgroundImage: 'url("/src/assets/button.png")',
        backgroundPosition: "50% -20%",
      }}
    >
      {children}
    </button>
  );
}
