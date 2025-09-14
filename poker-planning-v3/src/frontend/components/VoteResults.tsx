/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from "./ui/Card";
import { usePokerGameContext } from "./PokerGameContext";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useUrlParam } from "../hooks/useUrlParam";
import { BarChart3 } from "lucide-react";

export function VoteResults() {
  const layout = useUrlParam("results", "progress-percentage");

  if (layout === "table") {
    return <TableLayout />;
  }

  if (layout === "badge") {
    return <BadgeLayout />;
  }
  if (layout === "progress") {
    return <ProgressLayout />;
  }
  if (layout === "medals") {
    return <MedalsLayout />;
  }
  if (layout === "percentage") {
    return <PercentageLayout />;
  }
  if (layout === "progress-percentage") {
    return <ProgressWithPercentageLayout />;
  }
}

function useVoteResults() {
  const { game } = usePokerGameContext();

  const shouldShowResults = useMemo(
    () => Boolean(game?.players.every((p) => p.isOpen)),
    [game?.players],
  );

  const results = useMemo(() => {
    const cardsVotedMap: Record<string, number> = {};
    for (const player of game?.players ?? []) {
      if (player.card && player.card !== "") {
        if (!cardsVotedMap?.[player?.card]) {
          cardsVotedMap[player?.card] = 1;
        } else {
          cardsVotedMap[player?.card] += 1;
        }
      }
    }

    const entries = Object.entries(cardsVotedMap).sort(
      ([_, numVotesA], [__, numVotesB]) => numVotesB - numVotesA,
    );

    const totalVotes = entries.reduce((sum, [_, votes]) => sum + votes, 0);
    const maxVotes = Math.max(...entries.map(([_, votes]) => votes));

    // Verifica se há empate no primeiro lugar
    const hasFirstPlaceTie =
      entries.filter(([_, votes]) => votes === maxVotes).length > 1;

    return entries.map(([card, votes]) => ({
      card,
      votes,
      percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
      barPercentage: (votes / maxVotes) * 100,
      isTopVoted: votes === maxVotes && !hasFirstPlaceTie, // Só mostra se não há empate
    }));
  }, [game?.players]);

  return {
    shouldShowResults,
    results,
  };
}

function ResultLayoutTitle() {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      <BarChart3 className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold text-gray-800">
        Resultados da Votação
      </h3>
    </div>
  );
}

function TableLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults) {
    return <></>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Carta</TableHead>
          <TableHead className="text-center">Votos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results?.map(({ card, votes }) => (
          <TableRow key={`card${card}-votes${votes}`}>
            <TableCell className="flex justify-items-start">
              <Card
                onClick={() => {}}
                open={true}
                value={card}
                disabled={false}
              ></Card>
            </TableCell>
            <TableCell className="text-center font-medium">{votes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BadgeLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults || results.length === 0) {
    return <></>;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <ResultLayoutTitle />

      <div className="flex flex-wrap justify-center gap-4">
        {results.map(({ card, votes, isTopVoted }) => (
          <div key={`card${card}-votes${votes}`} className="relative">
            {/* Badge de ranking */}
            {isTopVoted && (
              <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
                👑
              </div>
            )}

            {/* Card com contador */}
            <div className="flex flex-col items-center space-y-2 rounded-lg border-2 border-transparent bg-white p-3 shadow-md transition-all hover:border-blue-300">
              <Card
                onClick={() => {}}
                open={true}
                value={card}
                disabled={false}
              />

              {/* Badge de votos */}
              <div className="rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                {votes} {votes === 1 ? "voto" : "votos"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults || results.length === 0) {
    return <></>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <ResultLayoutTitle />

      <div className="space-y-3">
        {results.map(({ card, votes, percentage, isTopVoted }) => (
          <div
            key={`card${card}-votes${votes}`}
            className="flex items-center gap-4"
          >
            {/* Card pequeno */}
            <div className="flex-shrink-0">
              <div className="scale-75">
                <Card
                  onClick={() => {}}
                  open={true}
                  value={card}
                  disabled={false}
                />
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {votes} {votes === 1 ? "voto" : "votos"}
                </span>
                {isTopVoted && (
                  <span className="text-xs font-bold text-yellow-600">
                    👑 Mais votado
                  </span>
                )}
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isTopVoted
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-blue-400 to-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedalsLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults || results.length === 0) {
    return <></>;
  }

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}º`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <ResultLayoutTitle />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map(({ card, votes, isTopVoted }, index) => (
          <div
            key={`card${card}-votes${votes}`}
            className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all ${
              isTopVoted
                ? "border-yellow-300 bg-yellow-50 shadow-md"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            {/* Posição */}
            <div className="mb-2 text-lg">{getMedal(index)}</div>

            {/* Card */}
            <div className="scale-75">
              <Card
                onClick={() => {}}
                open={true}
                value={card}
                disabled={false}
              />
            </div>

            {/* Votos */}
            <div
              className={`mt-2 rounded-full px-2 py-1 text-xs font-medium ${
                isTopVoted
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {votes} {votes === 1 ? "voto" : "votos"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PercentageLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults || results.length === 0) {
    return <></>;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <ResultLayoutTitle />

      <div className="flex flex-wrap justify-center gap-4">
        {results.map(({ card, votes, percentage, isTopVoted }) => (
          <div key={`card${card}-votes${votes}`} className="relative">
            {/* Badge de ranking */}
            {isTopVoted && (
              <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
                👑
              </div>
            )}

            {/* Card com contador */}
            <div className="flex flex-col items-center space-y-2 rounded-lg border-2 border-transparent bg-white p-3 shadow-md transition-all hover:border-blue-300">
              <Card
                onClick={() => {}}
                open={true}
                value={card}
                disabled={false}
              />

              {/* Badge de votos e porcentagem */}
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                  {votes} {votes === 1 ? "voto" : "votos"}
                </div>
                <div className="mt-1 text-xs font-medium text-gray-600">
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressWithPercentageLayout() {
  const { results, shouldShowResults } = useVoteResults();

  if (!shouldShowResults || results.length === 0) {
    return <></>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <ResultLayoutTitle />

      <div className="space-y-3">
        {results.map(
          ({ card, votes, percentage, barPercentage, isTopVoted }) => (
            <div
              key={`card${card}-votes${votes}`}
              className="flex items-center gap-4"
            >
              {/* Card pequeno */}
              <div className="flex-shrink-0">
                <div className="scale-75">
                  <Card
                    onClick={() => {}}
                    open={true}
                    value={card}
                    disabled={false}
                  />
                </div>
              </div>

              {/* Barra de progresso com informações */}
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {votes} {votes === 1 ? "voto" : "votos"} ({percentage}%)
                  </span>
                  {isTopVoted && (
                    <span className="text-xs font-bold text-yellow-600">
                      👑 Mais votado
                    </span>
                  )}
                </div>
                <div className="relative h-3 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isTopVoted
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-gradient-to-r from-blue-400 to-blue-500"
                    }`}
                    style={{ width: `${barPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
