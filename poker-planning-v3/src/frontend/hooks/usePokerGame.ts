import type { gameType, setPlayerCardEventType } from "@/shared/poker-types";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "../lib/socket";
import { defaultPokerCards } from "@/shared/poker-constants";
import { useReconnection } from "./useReconnection";
import { useUserId } from "./useUserId";

export function usePokerGame() {
  const [game, setGame] = useState<gameType>();
  const playerId = useUserId();
  const [cards, setCards] = useState<string[]>(defaultPokerCards);

  const {
    isReconnecting,
    reconnectionAttempts,
    saveGameData,
    getStoredGameData,
    clearStoredGameData,
    attemptReconnection,
    resetReconnectionAttempts,
    manualReconnect,
  } = useReconnection();

  //#region emmitted events
  const updatePlayerCard = useCallback(
    (card: string) => {
      if (!game?.id || !playerId) {
        return;
      }

      const data: setPlayerCardEventType = {
        card,
        gameId: game.id,
        playerId,
      };

      socket.emit("setPlayerCard", data);
    },
    [game?.id, playerId],
  );

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
        id: playerId,
      });
    },
    [playerId, saveGameData],
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

  //#endregion
  //#region helpers
  const isPlayerOnGame = useMemo(() => {
    return (game?.players?.findIndex((p) => p.id === playerId) ?? -1) > -1;
  }, [game?.players, playerId]);
  const resetCard = useCallback(() => {
    if (playerId) {
      updatePlayerCard("");
    }
  }, [updatePlayerCard, playerId]);
  //#endregion
  //#region (re)connection helpers

  const isCurrentPlayerDisconnected = useCallback(() => {
    if (!game || !playerId) return false;
    const currentPlayer = game.players.find((p) => p.id === playerId);
    return currentPlayer?.isDisconnected === true;
  }, [game, playerId]);
  const leaveGame = useCallback(() => {
    clearStoredGameData();
    setGame(undefined);
  }, [clearStoredGameData]);
  const onPlayerClientDisconnect = useCallback(() => {
    if (!game || !playerId) {
      return;
    }

    const newPlayers = game.players.map((p) => {
      if (p.id !== playerId) {
        return p;
      }

      return {
        ...p,
        isDisconnected: true,
      };
    });

    const newGame = {
      ...game,
      players: newPlayers,
    };

    setGame(newGame);
  }, [game, playerId]);

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
    socket.on("disconnect", (r) => {
      console.log("Socket desconectado, tentando reconectar...", r);
      setTimeout(attemptReconnection, 1000);
      onPlayerClientDisconnect();
    });
    socket.on("connect", () => {
      console.log("Socket reconectado!");

      if (isReconnecting) {
        const storedGameData = getStoredGameData();
        if (storedGameData) {
          socket.emit("connectToGame", {
            gameId: storedGameData.gameId,
            playerName: storedGameData.playerName,
            id: playerId,
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
    getStoredGameData,
    isReconnecting,
    onPlayerClientDisconnect,
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
    isPlayerOnGame,
  };
}
