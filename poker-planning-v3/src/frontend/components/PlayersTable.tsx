import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Card } from "./ui/Card";
import { usePokerGameContext } from "./PokerGameContext";
import type { playerType } from "@/shared/poker-types";
import { useUrlParam } from "../hooks/useUrlParam";
import { PlayerNameWithStatus } from "./ui/PlayerNameWithStatus";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";

function isCardOpen(p: playerType, playerId: string | undefined) {
  const cardIsNotEmpty = p.card !== "";
  const isMyPlayer = p.id === playerId;
  const cardIsOpen = p.isOpen;

  return cardIsOpen || (isMyPlayer && cardIsNotEmpty);
}

export function PlayersTable() {
  const layout = useUrlParam("layout", "table");

  return (
    <>
      <ConnectionStatusBanner />
      {layout === "grid" && <GridLayout />}
      {layout === "circle" && <CircleLayout />}
      {layout === "table" && <TableLayout />}
    </>
  );
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
          <TableRow
            key={p.id}
            className={p.isDisconnected ? "bg-gray-50 opacity-60" : ""}
          >
            <TableCell>
              <PlayerNameWithStatus
                player={p}
                isCurrentPlayer={p.id === playerId}
              />
            </TableCell>
            <TableCell className="flex justify-center">
              <div className="relative">
                <Card
                  onClick={() => resetCard()}
                  open={isCardOpen(p, playerId)}
                  value={p.card}
                  disabled={p.id !== playerId || p.isDisconnected}
                />
                {p.isDisconnected && (
                  <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-gray-200">
                    <span className="text-xs text-gray-600">⚡</span>
                  </div>
                )}
              </div>
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
          <div
            key={p.id}
            className={`flex flex-col items-center space-y-2 rounded-lg p-3 transition-all ${p.isDisconnected ? "border border-gray-200 bg-gray-50 opacity-60" : ""} `}
          >
            <div className="relative">
              <Card
                onClick={() => resetCard()}
                open={isCardOpen(p, playerId)}
                value={p.card}
                disabled={p.id !== playerId || p.isDisconnected}
              />
              {p.isDisconnected && (
                <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-gray-200">
                  <span className="text-xs text-gray-600">⚡</span>
                </div>
              )}
            </div>
            <PlayerNameWithStatus
              player={p}
              isCurrentPlayer={p.id === playerId}
              className="w-full text-center"
              size="sm"
            />
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

  const currentPlayer = players.find((p) => p.id === playerId);
  const otherPlayers = players.filter((p) => p.id !== playerId);

  const getContainerSize = (playerCount: number) => {
    if (playerCount === 0) return "";
    if (playerCount === 1) return "w-32 h-32";
    if (playerCount <= 6) return "w-80 h-80";
    if (playerCount <= 10) return "w-96 h-96";
    return "w-full aspect-square max-w-2xl";
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={`relative ${getContainerSize(players.length)} flex items-center justify-center`}
      >
        {/* Jogador atual no centro */}
        {currentPlayer && (
          <div
            className={`absolute z-10 flex flex-col items-center space-y-2 rounded-lg p-2 ${currentPlayer.isDisconnected ? "border border-red-200 bg-red-50" : ""} `}
          >
            <div className="relative">
              <Card
                onClick={() => resetCard()}
                open={isCardOpen(currentPlayer, playerId)}
                value={currentPlayer.card}
                disabled={currentPlayer.isDisconnected}
              />
              {currentPlayer.isDisconnected && (
                <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-gray-200">
                  <span className="text-xs text-gray-600">⚡</span>
                </div>
              )}
            </div>
            <PlayerNameWithStatus
              player={currentPlayer}
              isCurrentPlayer={true}
              className="text-center whitespace-nowrap"
              size="sm"
            />
          </div>
        )}

        {/* Outros jogadores em círculo */}
        {otherPlayers.map((p, index) => {
          const angle = (index * 360) / otherPlayers.length;
          const radius = 42;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={p.id}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center space-y-1 rounded-lg p-2 ${p.isDisconnected ? "border border-red-200 bg-red-50" : ""} `}
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
              }}
            >
              <div className="relative">
                <Card
                  onClick={() => resetCard()}
                  open={isCardOpen(p, playerId)}
                  value={p.card}
                  disabled={true}
                />
                {p.isDisconnected && (
                  <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-gray-200">
                    <span className="text-xs text-gray-600">⚡</span>
                  </div>
                )}
              </div>
              <PlayerNameWithStatus
                player={p}
                className="max-w-20 text-center whitespace-nowrap"
                size="sm"
              />
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
