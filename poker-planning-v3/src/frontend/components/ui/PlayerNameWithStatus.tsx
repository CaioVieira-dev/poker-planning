import { PlayerStatusIndicator } from "./PlayerStatusIndicator";
import type { playerType } from "@/shared/poker-types";

interface PlayerNameWithStatusProps {
  player: playerType;
  isCurrentPlayer?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function PlayerNameWithStatus({
  player,
  isCurrentPlayer = false,
  className = "",
  size = "md",
}: PlayerNameWithStatusProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={` ${isCurrentPlayer ? "font-bold" : "font-medium"} ${player.isDisconnected ? "text-gray-500 line-through" : ""} `}
      >
        {player.name}
        {isCurrentPlayer && " (Você)"}
      </span>
      <PlayerStatusIndicator player={player} size={size} />
    </div>
  );
}
