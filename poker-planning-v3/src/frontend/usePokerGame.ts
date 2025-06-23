import type { gameType, setPlayerCardEventType } from "@/shared/poker-types";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket = io();

export function usePokerGame() {
  const socketRef = useRef<Socket>(socket);
  const [game, setGame] = useState<gameType>();
  const possibleCards = useMemo(
    () => ["co", "?", "1", "2", "3", "5", "8", "13", "21"],
    [],
  );

  const getUserId = useCallback(() => {
    const STORAGE_KEY = "poker-user-id";
    let userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      userId = nanoid();
      localStorage.setItem(STORAGE_KEY, userId);
    }
    return userId;
  }, []);

  const updatePlayerCard = useCallback(
    (card: string) => {
      const sckt = socketRef?.current;
      if (!sckt) {
        return;
      }

      const data: setPlayerCardEventType = {
        card,
        gameId: "1",
        playerId: getUserId(),
      };

      sckt.emit("setPlayerCard", data);
    },
    [getUserId],
  );

  const resetCard = useCallback(() => {
    updatePlayerCard(getUserId());
  }, [getUserId, updatePlayerCard]);

  const connectToGame = useCallback(() => {
    const sckt = socketRef?.current;
    if (!sckt) {
      return;
    }

    sckt.emit("connectToGame", {
      gameId: "1",
      playerName: "caio",
      id: getUserId(),
    });
  }, [getUserId]);

  //#region emmitted events

  //#endregion

  useEffect(() => {
    //#region connection events

    // Crie o socket *dentro* do useEffect!
    socketRef.current = io();

    socketRef.current.on("msgToClient", (msg) => {
      console.log("Recebido do servidor:", msg);
    });
    //#endregion

    //#region received events
    socketRef.current.on("getGame", (data: gameType) => {
      setGame(data);
    });
    //#endregion

    return () => {
      //#region disconnection events
      // Cleanup só da instância criada por esse componente
      socketRef.current?.disconnect();
      //#endregion
    };
  }, []);

  return {
    game,
    resetCard,
    updatePlayerCard,
    possibleCards,
    connectToGame,
  };
}
