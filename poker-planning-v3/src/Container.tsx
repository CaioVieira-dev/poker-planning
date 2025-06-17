import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Container() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-500">
      <div className="w-md bg-slate-300">
        <div className="flex flex-wrap justify-evenly gap-2 px-4 pt-4">
          <Card>co</Card>
          <Card>?</Card>
          <Card>1</Card>
          <Card>2</Card>
          <Card>3</Card>
          <Card>5</Card>
          <Card>8</Card>
          <Card>13</Card>
          <Card>21</Card>
        </div>
        <div className="">
          <PlayersTable />
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-16 w-12 justify-center bg-slate-100 p-4 align-middle">
      {children}
    </div>
  );
}

const players = [
  {
    name: "Caio",
    card: "1",
  },
  {
    name: "Testerson",
    card: "5",
  },
  {
    name: "Zé",
    card: "13",
  },
];

function PlayersTable() {
  return (
    <Table>
      <TableCaption>
        Um poker planning que não minera bitcoin na aba XD
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Jogador</TableHead>
          <TableHead>Nota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.name}>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>
              <Card> {player.card}</Card>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
