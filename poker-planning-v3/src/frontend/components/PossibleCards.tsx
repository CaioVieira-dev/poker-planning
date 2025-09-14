import { Card } from "./ui/Card";
import { usePokerGameContext } from "./PokerGameContext";
import { useCallback, useMemo } from "react";

export function PossibleCards() {
  const { possibleCards, updatePlayerCard } = usePokerGameContext();

  const cardOnClick = useCallback(
    (cardValue: string) => () => {
      updatePlayerCard(cardValue);
    },
    [updatePlayerCard],
  );

  const memoizedCard = useMemo(
    () =>
      possibleCards.map((c, i) => (
        <Card
          key={`${c}-${i}`}
          onClick={cardOnClick(c)}
          open={!!c}
          value={c}
        ></Card>
      )),
    [cardOnClick, possibleCards],
  );

  return memoizedCard;
}
