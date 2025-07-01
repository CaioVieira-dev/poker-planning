import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Card } from "./components/ui/Card";
import { usePokerGameContext } from "./PokerGameContext";
import type { playerType } from "@/shared/poker-types";

function isCardOpen(p: playerType, playerId: string | undefined) {
  const cardIsNotEmpty = p.card !== "";
  const isMyPlayer = p.id === playerId;
  const cardIsOpen = p.isOpen;

  return cardIsOpen || (isMyPlayer && cardIsNotEmpty);
}

export function PlayersTable() {
  const { game, resetCard, playerId } = usePokerGameContext();

  return (
    <Table>
      <TableCaption>
        Um poker planning que não minera bitcoin na aba XD
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Jogador</TableHead>
          <TableHead className="text-center">Nota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {game?.players?.map?.((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell className="flex justify-center">
              <Card
                onClick={() => resetCard()}
                open={isCardOpen(p, playerId)}
                value={p.card}
                disabled={p.id !== playerId}
              ></Card>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
