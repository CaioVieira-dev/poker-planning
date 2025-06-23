export type cardType = string;

export type playerType = {
  id: string;
  card: cardType;
  name: string;
  isOpen: boolean;
};

export type gameType = {
  players: playerType[];
};

export type setPlayerCardEventType = {
  gameId: string;
  playerId: string;
  card: cardType;
};
