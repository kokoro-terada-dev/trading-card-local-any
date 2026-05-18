import Board from "./components/Board/Board";

import DeckSelect from "./components/DeckSelect/DeckSelect";

import MulliganScreen from "./components/Mulligan/MulliganScreen";

import { useGameStore } from "./store/gameStore";

function App() {
  const isStarted = useGameStore((x) => x.isStarted);

  const mulliganPlayerIndex =
    useGameStore((x) => x.mulliganPlayerIndex);

  const resetToDeckSelect =
    useGameStore((x) => x.resetToDeckSelect);

  if (!isStarted) {
    return <DeckSelect />;
  }

  if (mulliganPlayerIndex !== null) {
    return <MulliganScreen />;
  }

  return (
    <Board
      resetToDeckSelect={resetToDeckSelect}
    />
  );
}

export default App;