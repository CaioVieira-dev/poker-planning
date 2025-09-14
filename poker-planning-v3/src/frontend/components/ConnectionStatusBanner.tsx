import { usePokerGameContext } from "./PokerGameContext";
import { Button } from "@/frontend/components/ui/button";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Loader2, WifiOff, RotateCcw } from "lucide-react";

export function ConnectionStatusBanner() {
  const {
    isReconnecting,
    isDisconnected,
    reconnectionAttempts,
    manualReconnect,
    leaveGame,
  } = usePokerGameContext();

  if (!isDisconnected && !isReconnecting) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 p-4">
      <Alert
        className={`mx-auto max-w-2xl ${isReconnecting ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}`}
      >
        <div className="flex items-center gap-3">
          {isReconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}

          <AlertDescription className="flex-1">
            {isReconnecting ? (
              <span className="text-yellow-800">
                🔄 Reconectando... (Tentativa {reconnectionAttempts}/5)
                <br />
                <small className="text-yellow-600">
                  Você pode recarregar a página sem perder a conexão
                </small>
              </span>
            ) : (
              <span className="text-red-800">
                ⚠️ Você foi desconectado da sala
              </span>
            )}
          </AlertDescription>

          {!isReconnecting && (
            <div className="flex gap-2">
              <Button
                onClick={manualReconnect}
                size="sm"
                variant="outline"
                className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reconectar
              </Button>
              <Button
                onClick={leaveGame}
                size="sm"
                variant="outline"
                className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Sair da Sala
              </Button>
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
}
