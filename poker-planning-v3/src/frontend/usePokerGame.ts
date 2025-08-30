import type { gameType, setPlayerCardEventType } from "@/shared/poker-types";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket";
import { defaultPokerCards } from "@/shared/poker-constants";
import { useReconnection } from "./useReconnection";

export function usePokerGame() {
  const [game, setGame] = useState<gameType>();
  const [playerId, setPlayerId] = useState<string>();
  const [cards, setCards] = useState<string[]>(defaultPokerCards);

  const getPlayerId = useCallback(() => {
    if (playerId) {
      return playerId;
    }

    const STORAGE_KEY = "poker-user-id";
    let userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      userId = nanoid();
      localStorage.setItem(STORAGE_KEY, userId);
    }

    setPlayerId(userId);
    return userId;
  }, [playerId]);

  const {
    isReconnecting,
    reconnectionAttempts,
    saveGameData,
    getStoredGameData,
    clearStoredGameData,
    attemptReconnection,
    resetReconnectionAttempts,
  } = useReconnection(playerId);

  const updatePlayerCard = useCallback(
    (card: string) => {
      if (!game?.id || !playerId) {
        return;
      }

      const data: setPlayerCardEventType = {
        card,
        gameId: game.id,
        playerId: getPlayerId(),
      };

      socket.emit("setPlayerCard", data);
    },
    [game?.id, playerId, getPlayerId],
  );

  const resetCard = useCallback(() => {
    if (playerId) {
      updatePlayerCard("");
    }
  }, [updatePlayerCard, playerId]);

  const changePlayerCards = useCallback(
    (newPossibleCards: string[]) => {
      if (!playerId || !newPossibleCards || newPossibleCards?.length === 0) {
        return;
      }

      socket.emit("setGamePossibleCards", {
        gameId: game?.id,
        newPossibleCards,
      });
    },
    [game?.id, playerId],
  );

  const connectToGame = useCallback(
    ({
      gameId: _gameId,
      playerName,
    }: {
      gameId?: string;
      playerName: string;
    }) => {
      const gameId = _gameId ? _gameId : nanoid();
      saveGameData(gameId, playerName);
      window.history.pushState({}, "", `/rooms/${gameId}`);

      socket.emit("connectToGame", {
        gameId,
        playerName,
        id: getPlayerId(),
      });
    },
    [getPlayerId, saveGameData],
  );

  const toggleCardsVisibility = useCallback(() => {
    if (!game?.id || !playerId) {
      return;
    }

    socket.emit("togglePlayersCardVisibility", { gameId: game.id });
  }, [game?.id, playerId]);
  const resetPlayersCard = useCallback(() => {
    if (!game?.id || !playerId) {
      return;
    }

    socket.emit("resetPlayersCard", { gameId: game.id });
  }, [game?.id, playerId]);
  const manualReconnect = useCallback(() => {
    const storedGameData = getStoredGameData();
    if (!storedGameData) return;

    resetReconnectionAttempts();
    attemptReconnection();
  }, [attemptReconnection, getStoredGameData, resetReconnectionAttempts]);
  const isCurrentPlayerDisconnected = useCallback(() => {
    if (!game || !playerId) return false;
    const currentPlayer = game.players.find((p) => p.id === playerId);
    return currentPlayer?.isDisconnected === true;
  }, [game, playerId]);
  const leaveGame = useCallback(() => {
    clearStoredGameData();
    setGame(undefined);
  }, [clearStoredGameData]);

  //#region emmitted events

  //#endregion

  useEffect(() => {
    //#region received events
    socket.on("getGame", (data: gameType) => {
      setGame(data);

      // Reset da reconexão bem-sucedida
      if (isReconnecting && data) {
        const currentPlayer = data.players.find((p) => p.id === playerId);
        if (currentPlayer && !currentPlayer.isDisconnected) {
          resetReconnectionAttempts();
          console.log("Reconexão bem-sucedida!");
        }
      }

      setCards((prev) => {
        if (data?.possibleCards?.some?.((p) => !prev?.includes(p))) {
          return data.possibleCards ?? [];
        }
        return prev ?? [];
      });
    });
    socket.on("disconnect", () => {
      console.log("Socket desconectado, tentando reconectar...");
      setTimeout(attemptReconnection, 1000);
    });
    socket.on("connect", () => {
      console.log("Socket reconectado!");

      if (isReconnecting) {
        const storedGameData = getStoredGameData();
        if (storedGameData) {
          socket.emit("connectToGame", {
            gameId: storedGameData.gameId,
            playerName: storedGameData.playerName,
            id: getPlayerId(),
          });
        }
      }
    });
    //#endregion

    return () => {
      socket.off("getGame");
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [
    attemptReconnection,
    getPlayerId,
    getStoredGameData,
    isReconnecting,
    playerId,
    resetReconnectionAttempts,
  ]);
  // Auto-reconexão quando detecta desconexão
  useEffect(() => {
    if (isCurrentPlayerDisconnected() && !isReconnecting) {
      console.log("Jogador desconectado detectado, tentando reconectar...");
      attemptReconnection();
    }
  }, [isCurrentPlayerDisconnected, isReconnecting, attemptReconnection]);
  useEffect(() => {
    const match = window.location.pathname.match(/^\/rooms\/([a-zA-Z0-9_-]+)/);

    if (!game && match) {
      socket.emit("spectateGame", match[1]);
    }
  }, [game]);

  return {
    game,
    resetCard,
    updatePlayerCard,
    possibleCards: cards,
    connectToGame,
    playerId,
    toggleCardsVisibility,
    resetPlayersCard,
    changePlayerCards,
    isReconnecting,
    isDisconnected: isCurrentPlayerDisconnected(),
    reconnectionAttempts,
    manualReconnect,
    leaveGame,
  };
}
