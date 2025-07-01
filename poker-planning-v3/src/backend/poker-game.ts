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

function createGame(_gameId: string) {
  const [...gamesIds] = games.keys();
  const gameId = !gamesIds.includes(_gameId) ? _gameId : nanoid();
  games.set(gameId, { id: gameId, players: [] });

  return gameId;
}
function removeGameIfGameRoomIsEmpty(gameId: string) {
  const game = games.get(gameId);

  if (!game || game?.players?.length !== 0) {
    return;
  }

  games.delete(gameId);
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

        if (!game.players.some((p) => p.id === id)) {
          addPlayer(gameId, {
            card: "",
            name: playerName,
            id,
          });
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
        removePlayer(room, playerId);
        removeGameIfGameRoomIsEmpty(room);

        io.to(room).emit("getGame", games.get(room));
      }
    });
  });
}
