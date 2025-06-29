import { PokerGame } from "./PokerGame";
import { PokerGameProvider } from "./PokerGameContext";

function App() {
  return (
    <>
      <PokerGameProvider>
        <PokerGame />
      </PokerGameProvider>
    </>
  );
}

export default App;
