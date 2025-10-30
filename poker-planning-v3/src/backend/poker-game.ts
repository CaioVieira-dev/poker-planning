import { defaultPokerCards } from "@/shared/poker-constants";
import type {
  cardType,
  gameType,
  playerType,
  setPlayerCardEventType,
  socketData,
} from "@/shared/poker-types";
import { nanoid } from "nanoid";
import type { DefaultEventsMap, Server } from "socket.io";

const games = new Map<string, gameType>();
const disconnectionTimeouts = new Map<string, NodeJS.Timeout>();
/*o tempo tipico para um usuario saber que ficou offline é de 45 segundos
 * 25 segundos do "ping" do socket.io + 20 segundos do "pong"
 */
const DISCONNECTION_DELAY = 300000; // 300 segundos ou 5 minutos

function addPlayer(
  gameId: string,
  player: {
    card: cardType;
    name: string;
    id: string;
  },
) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  const newPlayer: playerType = {
    card: player.card,
    id: player.id,
    isOpen: false,
    name: player.name,
  };

  game.players.push(newPlayer);
}

function removePlayer(gameId: string, playerId: string) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  game.players = game.players.filter((p) => p.id !== playerId);
}

function getPlayerGame(gameId: string, playerId: string) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  const player = game.players.find((p) => p.id === playerId);

  if (!player) {
    return;
  }

  return player;
}

function setPlayerCard({
  gameId,
  playerId,
  card,
}: {
  gameId: string;
  playerId: string;
  card: cardType;
}) {
  const playerGame = getPlayerGame(gameId, playerId);
  if (!playerGame) {
    return;
  }

  playerGame.card = card;
}
function togglePlayersCardVisibility({ gameId }: { gameId: string }) {
  const game = games.get(gameId);
  if (!game) {
    return;
  }

  const { players } = game;

  game.players = players.map((p) => {
    p.isOpen = !p.isOpen;

    return p;
  });
}
function resetPlayersCard({ gameId }: { gameId: string }) {
  const game = games.get(gameId);
  if (!game) {
    return;
  }

  const { players } = game;

  game.players = players.map((p) => {
    p.card = "";
    p.isOpen = false;

    return p;
  });
}

async function keepGamesAlive() {
  const hasGameRunning = games.size > 0;
  console.log("keepalive");

  if (!hasGameRunning) {
    console.log("Nenhum jogo ativo, keep-alive não será executado");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.BASE_URL || "http://localhost:3001"}/api/health-check`,
    );

    if (response.ok) {
      console.log(
        "Mantendo os jogos com sucesso. Jogos em andamento:",
        games.size,
      );
    } else {
      console.error("Erro no keep-alive:", response.status);
    }
  } catch (error) {
    console.error("Erro ao executar keep-alive:", error);
  }

  setTimeout(
    () => {
      console.log("timeout");
      keepGamesAlive();
    },
    13 * 60 * 1000,
  );
}

function createGame(_gameId: string) {
  const [...gamesIds] = games.keys();
  const gameId = !gamesIds.includes(_gameId) ? _gameId : nanoid();
  games.set(gameId, {
    id: gameId,
    players: [],
    possibleCards: defaultPokerCards,
  });
  if (games.size === 1) {
    keepGamesAlive();
  }

  return gameId;
}
function setGamePossibleCards(gameId: string, newPossibleCards: string[]) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  game.possibleCards = newPossibleCards;

  resetPlayersCard({
    gameId,
  });
}
function removeGameIfGameRoomIsEmpty(gameId: string) {
  const game = games.get(gameId);

  if (!game || game?.players?.length !== 0) {
    return;
  }

  games.delete(gameId);
}

function markPlayerAsDisconnected(gameId: string, playerId: string) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  const player = game.players.find((p) => p.id === playerId);
  if (player) {
    player.isDisconnected = true;
  }
}

function markPlayerAsConnected(gameId: string, playerId: string) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  const player = game.players.find((p) => p.id === playerId);
  if (player) {
    player.isDisconnected = false;
  }
}

export function registerPokerGameSocket(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>,
) {
  io.on("connection", (socket) => {
    socket.on(
      "setPlayerCard",
      ({ card, gameId, playerId }: setPlayerCardEventType) => {
        setPlayerCard({
          card,
          gameId,
          playerId,
        });

        io.to(gameId).emit("getGame", games.get(gameId));
      },
    );

    socket.on(
      "togglePlayersCardVisibility",
      ({ gameId }: { gameId: string }) => {
        togglePlayersCardVisibility({
          gameId,
        });

        io.to(gameId).emit("getGame", games.get(gameId));
      },
    );
    socket.on("resetPlayersCard", ({ gameId }: { gameId: string }) => {
      resetPlayersCard({
        gameId,
      });

      io.to(gameId).emit("getGame", games.get(gameId));
    });
    socket.on(
      "setGamePossibleCards",
      ({
        gameId,
        newPossibleCards,
      }: {
        gameId: string;
        newPossibleCards: string[];
      }) => {
        setGamePossibleCards(gameId, newPossibleCards);

        io.to(gameId).emit("getGame", games.get(gameId));
      },
    );

    socket.on("spectateGame", (gameId: string) => {
      socket.join(gameId);
      socket.emit("getGame", games.get(gameId));
    });

    socket.on(
      "connectToGame",
      ({
        gameId: _gameId,
        playerName,
        id,
      }: {
        gameId?: string;
        playerName: string;
        id: string;
      }) => {
        let gameId = typeof _gameId === "string" ? _gameId : nanoid();
        let game = games.get(gameId);

        if (!game) {
          gameId = createGame(gameId);
          game = games.get(gameId);
        }

        if (!game) {
          return;
        }

        const timeoutKey = `${gameId}:${id}`;
        if (disconnectionTimeouts.has(timeoutKey)) {
          clearTimeout(disconnectionTimeouts.get(timeoutKey)!);
          disconnectionTimeouts.delete(timeoutKey);

          markPlayerAsConnected(gameId, id);
          console.log(`Jogador ${playerName} reconectou-se à sala ${gameId}`);
        } else {
          if (!game.players.some((p) => p.id === id)) {
            addPlayer(gameId, {
              card: "",
              name: playerName,
              id,
            });
          }
        }

        socket.join(gameId);

        const data = socket.data as socketData;
        data.room = gameId;
        data.playerId = id;

        io.to(gameId).emit("getGame", games.get(gameId));
      },
    );

    socket.on("disconnect", () => {
      const { room, playerId } = socket.data as socketData;
      if (room && playerId && games.has(room)) {
        const timeoutKey = `${room}:${playerId}`;
        markPlayerAsDisconnected(room, playerId);

        const player = getPlayerGame(room, playerId);
        console.log(
          `Jogador ${player?.name ?? "sem nome na sala"} ${playerId} desconectou. Aguardando ${DISCONNECTION_DELAY / 1000}s para remoção...`,
        );

        const timeout = setTimeout(() => {
          console.log(
            `Removendo jogador ${player?.name ?? "sem nome na sala"} ${playerId} da sala ${room} após timeout`,
          );

          removePlayer(room, playerId);
          removeGameIfGameRoomIsEmpty(room);
          disconnectionTimeouts.delete(timeoutKey);

          io.to(room).emit("getGame", games.get(room));
        }, DISCONNECTION_DELAY);

        // Salva o timeout para poder cancelá-lo se o jogador reconectar
        disconnectionTimeouts.set(timeoutKey, timeout);

        io.to(room).emit("getGame", games.get(room));
      }
    });
  });
}
