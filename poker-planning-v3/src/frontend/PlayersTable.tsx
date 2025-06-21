import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import type { gameType } from "@/shared/poker-types";
import { Card } from "./components/ui/Card";

export function PlayersTable({
  game,
  resetCard,
}: {
  game: gameType | undefined;
  resetCard: (id: string) => void;
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
        {game?.players?.map?.((player) => (
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
