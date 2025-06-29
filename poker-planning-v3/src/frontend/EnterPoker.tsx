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
import { useCallback, useEffect, useState } from "react";
import { usePokerGameContext } from "./PokerGameContext";

export function EnterPoker() {
  const { connectToGame } = usePokerGameContext();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const enterOrCreateRoom = useCallback(() => {
    connectToGame({
      playerName: name,
      gameId: room,
    });
  }, [connectToGame, name, room]);

  const reset = useCallback(() => {
    setName("");
    setRoom("");
  }, []);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/rooms\/([a-zA-Z0-9_-]+)/);
    if (match) {
      setRoom(match[1]);
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Entrar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar</DialogTitle>
          <DialogDescription>
            Entre em uma sala de poker ou crie uma nova sala ao entrar sem
            preencher a sala.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Nome na sala</Label>
            <Input
              id="name"
              name="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              // defaultValue="Pedro Duarte" //TODO: adicionar sugestão de nome aleatorio
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="room">Sala</Label>
            <Input
              id="room"
              name="room"
              value={room}
              placeholder="Identificador da sala..."
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={enterOrCreateRoom}>
              Entrar!
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
