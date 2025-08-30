export type cardType = string;

export type playerType = {
  id: string;
  card: cardType;
  name: string;
  isOpen: boolean;
  isDisconnected?: boolean;
};

export type gameType = {
  players: playerType[];
  possibleCards: string[];
  id: string;
};

export type setPlayerCardEventType = {
  gameId: string;
  playerId: string;
  card: cardType;
};

export type socketData = {
  room?: string;
  playerId?: string;
};
