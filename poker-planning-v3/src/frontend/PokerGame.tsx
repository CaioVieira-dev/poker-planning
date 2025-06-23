import { Container } from "./components/ui/Container";
import { Card } from "./components/ui/Card";
import { PlayersTable } from "./PlayersTable";
import { usePokerGame } from "./usePokerGame";
import { Button } from "./components/ui/button";

export function PokerGame() {
  const { game, possibleCards, resetCard, updatePlayerCard, connectToGame } =
    usePokerGame();

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
        <Button onClick={connectToGame}>Entrar</Button>
      </div>
    </Container>
  );
}
