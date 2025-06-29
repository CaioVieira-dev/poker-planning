import type { gameType, setPlayerCardEventType } from "@/shared/poker-types";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "./socket";

export function usePokerGame() {
  const [game, setGame] = useState<gameType>();
  const [playerId, setPlayerId] = useState<string>();

  const possibleCards = useMemo(
    () => ["☕", "?", "1", "2", "3", "5", "8", "13", "21"],
    [],
  );

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

  const connectToGame = useCallback(
    ({
      gameId: _gameId,
      playerName,
    }: {
      gameId?: string;
      playerName: string;
    }) => {
      const gameId = _gameId ? _gameId : nanoid();
      window.history.pushState({}, "", `/rooms/${gameId}`);

      socket.emit("connectToGame", {
        gameId,
        playerName,
        id: getPlayerId(),
      });
    },
    [getPlayerId],
  );

  const toggleCardsVisibility = useCallback(() => {
    if (!game?.id || !playerId) {
      return;
    }

    socket.emit("togglePlayersCardVisibility", { gameId: game.id });
  }, [game?.id, playerId]);

  //#region emmitted events

  //#endregion

  useEffect(() => {
    //#region connection events

    socket.on("msgToClient", (msg) => {
      console.log("Recebido do servidor:", msg);
    });
    //#endregion

    //#region received events
    socket.on("getGame", (data: gameType) => {
      setGame(data);
      console.log("no getGame", data);
    });
    //#endregion

    return () => {
      //#region disconnection events
      socket.off("msgToClient");
      socket.off("getGame");
      //#endregion
    };
  }, []);
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
    possibleCards,
    connectToGame,
    playerId,
    toggleCardsVisibility,
  };
}
