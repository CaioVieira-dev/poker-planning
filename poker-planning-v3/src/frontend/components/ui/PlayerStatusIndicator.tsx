// components/PlayerStatusIndicator.tsx
import { Badge } from "@/frontend/components/ui/badge";
import { WifiOff } from "lucide-react";
import type { playerType } from "@/shared/poker-types";

interface PlayerStatusIndicatorProps {
  player: playerType;
  size?: "sm" | "md";
}

export function PlayerStatusIndicator({
  player,
  size = "md",
}: PlayerStatusIndicatorProps) {
  if (!player.isDisconnected) return null;

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <Badge
      variant="secondary"
      className="gap-1 border-red-200 bg-red-100 text-red-700"
    >
      <WifiOff className={iconSize} />
      {size === "md" && "Desconectado"}
    </Badge>
  );
}
