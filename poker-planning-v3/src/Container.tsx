import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Container() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-500">
      <div className="w-md bg-slate-300">
        <PokerGame />
      </div>
    </div>
  );
}

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

function PokerGame() {
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
  );
}

function Card({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex h-16 w-12 justify-center bg-slate-100 p-4 align-middle"
      onClick={onClick}
    >
      {children}
    </div>
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
