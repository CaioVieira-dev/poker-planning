import { Container } from "./components/ui/Container";
import { Card } from "./components/ui/Card";
import { PlayersTable } from "./PlayersTable";
import { EnterPoker } from "./EnterPoker";
import { usePokerGameContext } from "./PokerGameContext";
import { useCallback, useMemo } from "react";
import { Button } from "./components/ui/button";
import { ChangeGameCards } from "./ChangeGameCards";
import { VoteResults } from "./VoteResults";

export function PokerGame() {
  const {
    possibleCards,
    updatePlayerCard,
    toggleCardsVisibility,
    resetPlayersCard,
  } = usePokerGameContext();

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

  const memoizedChangeCards = useMemo(() => <ChangeGameCards />, []);

  return (
    <Container>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex flex-wrap justify-evenly gap-2">
          {memoizedCard}
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleCardsVisibility}>Virar cartas</Button>
          <Button onClick={resetPlayersCard}>Limpar cartas</Button>
          {memoizedChangeCards}
        </div>
        <div className="">
          <VoteResults />
        </div>
        <div className="">
          <PlayersTable />
        </div>
        <EnterPoker />
      </div>
    </Container>
  );
}
