import type { cardType, gameType, playerType } from "@/shared/poker-types";
import type { DefaultEventsMap, Server } from "socket.io";

const game = {
  players: [
    {
      name: "Caio",
      card: "1",
      id: "1",
      isOpen: true,
    },
    {
      name: "Testerson",
      card: "5",
      id: "2",
      isOpen: true,
    },
    {
      name: "Zé",
      card: "13",
      id: "3",
      isOpen: true,
    },
  ],
};

const games = new Map<string, gameType>();
games.set("1", game);

function addPlayer(
  gameId: string,
  player: {
    card: cardType;
    name: string;
  },
) {
  const game = games.get(gameId);

  if (!game) {
    return;
  }

  const newPlayer: playerType = {
    card: player.card,
    id: "", //todo: gerar id aleatorio
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

  game.players.filter((p) => p.id === playerId);
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
function togglePlayerCardVisibility({
  gameId,
  playerId,
  isOpen,
}: {
  gameId: string;
  playerId: string;
  isOpen: boolean;
}) {
  const playerGame = getPlayerGame(gameId, playerId);
  if (!playerGame) {
    return;
  }

  playerGame.isOpen = isOpen;
}

function createGame() {
  const [...gamesIds] = games.keys();
  const gameId = `${gamesIds.length + 1}`;
  games.set(gameId, { players: [] });

  return gameId;
}
function removeGame(gameId: string) {
  const game = games.get(gameId);

  if (!game) {
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
      ({
        card,
        gameId,
        playerId,
      }: {
        gameId: string;
        playerId: string;
        card: cardType;
      }) => {
        setPlayerCard({
          card,
          gameId,
          playerId,
        });

        io.emit("getGame", games.get(gameId));
      },
    );

    socket.on(
      "togglePlayerCardVisibility",
      ({
        isOpen,
        gameId,
        playerId,
      }: {
        gameId: string;
        playerId: string;
        isOpen: boolean;
      }) => {
        togglePlayerCardVisibility({
          gameId,
          isOpen,
          playerId,
        });

        io.emit("getGame", games.get(gameId));
      },
    );

    socket.on(
      "connectToGame",
      ({
        gameId: _gameId,
        playerName,
      }: {
        gameId: string;
        playerName: string;
      }) => {
        let gameId = _gameId;
        let game = games.get(gameId);

        if (!game) {
          gameId = createGame();
          game = games.get(gameId);
        }

        if (!game) {
          return;
        }

        if (!game.players.some((p) => p.name === playerName)) {
          addPlayer(gameId, {
            card: "",
            name: playerName,
          });
        }

        io.emit("getGame", games.get(gameId));
      },
    );
  });
}
