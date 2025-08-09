import { createContext, useContext } from "react";

export const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame 必须在 GameProvider 内使用");
  }
  return ctx;
}


