import { Container } from "./components/ui/Container";
import { Card } from "./components/ui/Card";
import { PlayersTable } from "./PlayersTable";
import { EnterPoker } from "./EnterPoker";
import { usePokerGameContext } from "./PokerGameContext";

export function PokerGame() {
  const { game, possibleCards, resetCard, updatePlayerCard } =
    usePokerGameContext();

  return (
    <Container>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex flex-wrap justify-evenly gap-2">
          {possibleCards.map((c, i) => (
            <Card key={`${c}-${i}`} onClick={() => updatePlayerCard(c)}>
              {c}
            </Card>
          ))}
        </div>
        <div className="">
          <PlayersTable game={game} resetCard={resetCard} />
        </div>
        <EnterPoker />
      </div>
    </Container>
  );
}
