import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { useCallback, useState } from "react";
import { usePokerGameContext } from "./PokerGameContext";
import { PlusIcon } from "lucide-react";
import { Card } from "./components/ui/Card";

export function ChangeGameCards() {
  const { changePlayerCards, playerId } = usePokerGameContext();
  const [newPlayerCards, setNewPlayerCards] = useState<string[]>([]);
  const [newPlayerCard, setNewPlayerCard] = useState<string>("");

  const changeRoomCards = useCallback(() => {
    changePlayerCards(newPlayerCards);
  }, [changePlayerCards, newPlayerCards]);

  const reset = useCallback(() => {
    setNewPlayerCard("");
  }, []);
  const addPossibleCard = useCallback(() => {
    if (newPlayerCard) {
      setNewPlayerCards((p) => {
        return [...p, newPlayerCard];
      });
      reset();
    }
  }, [newPlayerCard, reset]);

  const removePossibleCard = useCallback((index: number) => {
    setNewPlayerCards((p) => {
      return p.filter((_, i) => i !== index);
    });
  }, []);

  if (!playerId) {
    return <></>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Trocar cartas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trocar cartas</DialogTitle>
          <DialogDescription>Personalize seu poker :)</DialogDescription>
          <DialogDescription className="-mt-3 opacity-50">
            <small>4 não é uma nota que deveria existir XD</small>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="newCard">Nova carta</Label>
            <div className="flex">
              <Input
                id="newCard"
                name="newCard"
                onChange={(e) => setNewPlayerCard(e.target.value)}
                value={newPlayerCard}
                type="text"
                className="rounded-r-none"
                maxLength={3}
              />
              <Button
                type="button"
                onClick={addPossibleCard}
                className="rounded-l-none"
              >
                <PlusIcon />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {newPlayerCards.map((v, i) => (
              <Card
                open
                value={v}
                key={`${v}-${i}`}
                onClick={() => removePossibleCard(i)}
              />
            ))}
          </div>
          <div className="text-muted-foreground text-sm">
            Clique na carta para remove-la
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={changeRoomCards}>
              Mudar cartas!
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
