import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Container } from "./components/ui/Container";
import { Card } from "./components/ui/Card";

type playerType = {
  name: string;
  card: string;
  id: number;
};

const players = [
  {
    name: "Caio",
    card: "1",
    id: 1,
  },
  {
    name: "Testerson",
    card: "5",
    id: 2,
  },
  {
    name: "Zé",
    card: "13",
    id: 3,
  },
];

export function PokerGame() {
  const [game, setGame] = useState<playerType[]>(players);
  const possibleCards = useMemo(
    () => ["co", "?", "1", "2", "3", "5", "8", "13", "21"],
    [],
  );

  const resetCard = useCallback((id: number) => {
    setGame((prevGame) =>
      prevGame.reduce<playerType[]>((acc, curr) => {
        if (curr.id === id) {
          acc.push({ ...curr, card: "" });
        } else {
          acc.push(curr);
        }

        return acc;
      }, []),
    );
  }, []);

  const updatePlayerCard = useCallback((id: number, card: string) => {
    setGame((prevGame) =>
      prevGame.reduce<playerType[]>((acc, curr) => {
        if (curr.id === id) {
          acc.push({ ...curr, card });
        } else {
          acc.push(curr);
        }

        return acc;
      }, []),
    );
  }, []);

  return (
    <Container>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex flex-wrap justify-evenly gap-2">
          {possibleCards.map((c, i) => (
            <Card key={`${c}-${i}`} onClick={() => updatePlayerCard(1, c)}>
              {c}
            </Card>
          ))}
        </div>
        <div className="">
          <PlayersTable game={game} resetCard={resetCard} />
        </div>
      </div>
      <TestSocket />
    </Container>
  );
}

function PlayersTable({
  game,
  resetCard,
}: {
  game: playerType[];
  resetCard: (id: number) => void;
}) {
  return (
    <Table>
      <TableCaption>
        Um poker planning que não minera bitcoin na aba XD
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Jogador</TableHead>
          <TableHead>Nota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {game.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>
              <Card onClick={() => resetCard(player.id)}>{player.card}</Card>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { io, Socket } from "socket.io-client";
import { Button } from "./components/ui/button";

const socket = io();

function TestSocket() {
  const socketRef = useRef<Socket>(socket);

  useEffect(() => {
    // Crie o socket *dentro* do useEffect!
    socketRef.current = io();

    socketRef.current.on("msgToClient", (msg) => {
      console.log("Recebido do servidor:", msg);
    });

    return () => {
      // Cleanup só da instância criada por esse componente
      socketRef.current?.disconnect();
    };
  }, []);

  const enviar = () => {
    console.log("cliquei");
    socketRef.current?.emit("msgToServer", "Mensagem testando socket!");
  };

  return <Button onClick={enviar}>Enviar mensagem</Button>;
}
