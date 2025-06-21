import type { gameType, playerType } from "@/shared/poker-types";
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

  const resetCard = useCallback((id: string) => {
    setGame((prevGame) => ({
      players:
        prevGame?.players?.reduce<playerType[]>((acc, curr) => {
          if (curr.id === id) {
            acc.push({ ...curr, card: "" });
          } else {
            acc.push(curr);
          }

          return acc;
        }, []) ?? [],
    }));
  }, []);

  const updatePlayerCard = useCallback((id: string, card: string) => {
    setGame((prevGame) => ({
      players:
        prevGame?.players?.reduce<playerType[]>((acc, curr) => {
          if (curr.id === id) {
            acc.push({ ...curr, card });
          } else {
            acc.push(curr);
          }

          return acc;
        }, []) ?? [],
    }));
  }, []);

  const connectToGame = useCallback(() => {
    const sckt = socketRef?.current;
    if (!sckt) {
      return;
    }

    sckt.emit("connectToGame", { gameId: "1", playerName: "caio" });
  }, []);

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
