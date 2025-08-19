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
import { useUrlParam } from "./useUrlParam";

function isCardOpen(p: playerType, playerId: string | undefined) {
  const cardIsNotEmpty = p.card !== "";
  const isMyPlayer = p.id === playerId;
  const cardIsOpen = p.isOpen;

  return cardIsOpen || (isMyPlayer && cardIsNotEmpty);
}

export function PlayersTable() {
  const layout = useUrlParam("layout", "table");

  if (layout === "grid") {
    return <GridLayout />;
  }
  if (layout === "circle") {
    return <CircleLayout />;
  }

  if (layout === "table") {
    return <TableLayout />;
  }
}

function TableLayout() {
  const { game, resetCard, playerId } = usePokerGameContext();

  return (
    <Table>
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
      <TableCaption>
        Um poker planning que não minera bitcoin na aba XD
      </TableCaption>
    </Table>
  );
}

function GridLayout() {
  const { game, resetCard, playerId } = usePokerGameContext();

  return (
    <div className="w-full">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {game?.players?.map?.((p) => (
          <div key={p.id} className="flex flex-col items-center space-y-2">
            <Card
              onClick={() => resetCard()}
              open={isCardOpen(p, playerId)}
              value={p.card}
              disabled={p.id !== playerId}
            />
            <span className="w-full truncate px-1 text-center text-sm font-medium">
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mb-4 text-center text-sm">
        Um poker planning que não minera bitcoin na aba XD
      </div>
    </div>
  );
}

function CircleLayout() {
  const { game, resetCard, playerId } = usePokerGameContext();
  const players = game?.players || [];

  // Separa o jogador atual dos outros
  const currentPlayer = players.find((p) => p.id === playerId);
  const otherPlayers = players.filter((p) => p.id !== playerId);

  // Calcula altura dinâmica baseada no número de jogadores
  const getContainerSize = (playerCount: number) => {
    if (playerCount === 0) return ""; //  ninguém
    if (playerCount === 1) return "w-32 h-32"; // Apenas jogador atual
    if (playerCount <= 6) return "w-80 h-80"; // Jogadores médios
    if (playerCount <= 10) return "w-96 h-96"; // Muitos jogadores
    return "w-full aspect-square max-w-2xl"; // Sala cheia
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={`relative ${getContainerSize(players.length)} flex items-center justify-center`}
      >
        {/* Jogador atual no centro */}
        {currentPlayer && (
          <div className="absolute z-10 flex flex-col items-center space-y-2">
            <Card
              onClick={() => resetCard()}
              open={isCardOpen(currentPlayer, playerId)}
              value={currentPlayer.card}
              disabled={false}
            />
            <span className="rounded bg-blue-100 px-2 py-1 text-center text-sm font-bold whitespace-nowrap">
              {currentPlayer.name}
            </span>
          </div>
        )}

        {/* Outros jogadores em círculo */}
        {otherPlayers.map((p, index) => {
          // Distribui os outros jogadores em círculo
          const angle = (index * 360) / otherPlayers.length;
          const radius = 42; // Porcentagem do raio
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={p.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center space-y-1"
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
              }}
            >
              <Card
                onClick={() => resetCard()}
                open={isCardOpen(p, playerId)}
                value={p.card}
                disabled={true}
              />
              <span className="max-w-20 truncate text-center text-xs font-medium whitespace-nowrap">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground mb-6 text-center text-sm">
        Um poker planning que não minera bitcoin na aba XD
      </div>
    </div>
  );
}
