import { useCallback, useState, useRef } from "react";
import { socket } from "../socket";
import { nanoid } from "nanoid";

const STORAGE_KEYS = {
  GAME_DATA: "poker-game-data",
  RECONNECTION_ATTEMPTS: "poker-reconnection-attempts",
} as const;

const maxReconnectionAttempts = 5;
const reconnectionDelay = 2000;
const maxStoredDataAge = 5 * 60 * 1000;

export function useReconnection(playerId: string | undefined) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectionAttemptsRef = useRef(0);

  const saveGameData = useCallback((gameId: string, playerName: string) => {
    const gameData = {
      gameId,
      playerName,
      lastConnectionTime: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.GAME_DATA, JSON.stringify(gameData));
    localStorage.setItem(STORAGE_KEYS.RECONNECTION_ATTEMPTS, "0");
  }, []);

  const getStoredGameData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_DATA);
      if (!stored) return null;

      const gameData = JSON.parse(stored);

      if (Date.now() - gameData.lastConnectionTime > maxStoredDataAge) {
        localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
        localStorage.removeItem(STORAGE_KEYS.RECONNECTION_ATTEMPTS);
        return null;
      }

      return gameData;
    } catch {
      return null;
    }
  }, []);

  const getReconnectionAttempts = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECONNECTION_ATTEMPTS);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const saveReconnectionAttempts = useCallback((attempts: number) => {
    localStorage.setItem(
      STORAGE_KEYS.RECONNECTION_ATTEMPTS,
      attempts.toString(),
    );
    reconnectionAttemptsRef.current = attempts;
    setIsReconnecting(attempts > 0 && attempts < maxReconnectionAttempts);
  }, []);

  const clearStoredGameData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
    localStorage.removeItem(STORAGE_KEYS.RECONNECTION_ATTEMPTS);
    reconnectionAttemptsRef.current = 0;
    setIsReconnecting(false);
  }, []);

  const attemptReconnection = useCallback(() => {
    const storedGameData = getStoredGameData();
    const currentAttempts = getReconnectionAttempts();

    if (!storedGameData || currentAttempts >= maxReconnectionAttempts) {
      setIsReconnecting(false);
      if (currentAttempts >= maxReconnectionAttempts) {
        console.log("Máximo de tentativas de reconexão atingido");
      }
      return;
    }

    console.log(
      `Tentativa de reconexão ${currentAttempts + 1}/${maxReconnectionAttempts}`,
    );

    setIsReconnecting(true);
    const newAttempts = currentAttempts + 1;
    saveReconnectionAttempts(newAttempts);

    setTimeout(() => {
      const { gameId, playerName } = storedGameData;

      socket.emit("connectToGame", {
        gameId,
        playerName,
        id: playerId ?? nanoid(),
      });
    }, reconnectionDelay);
  }, [
    getStoredGameData,
    getReconnectionAttempts,
    saveReconnectionAttempts,
    playerId,
  ]);

  const resetReconnectionAttempts = useCallback(() => {
    saveReconnectionAttempts(0);
  }, [saveReconnectionAttempts]);

  return {
    isReconnecting,
    reconnectionAttempts: reconnectionAttemptsRef.current,
    saveGameData,
    getStoredGameData,
    clearStoredGameData,
    attemptReconnection,
    resetReconnectionAttempts,
  };
}
