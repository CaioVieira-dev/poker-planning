import React, { createContext, useContext } from "react";
import { usePokerGame } from "../hooks/usePokerGame";

type PokerGameContextType = ReturnType<typeof usePokerGame>;

const PokerGameContext = createContext<PokerGameContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const usePokerGameContext = () => {
  const ctx = useContext(PokerGameContext);
  if (!ctx)
    throw new Error(
      "usePokerGameContext precisa estar dentro do PokerGameProvider",
    );
  return ctx;
};

// Provider
export const PokerGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pokerGame = usePokerGame();
  return (
    <PokerGameContext.Provider value={pokerGame}>
      {children}
    </PokerGameContext.Provider>
  );
};
