import { useState } from "react";
import "./App.css";
import { ChunkRecorder } from "./chunkRecorder";
import { Guessing } from "./Guessing";
import { NewGame } from "./NewGame";

// todo: this is inplace, change that?
function shuffleArray<A>(array: A[]): A[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type GameState =
  | {
      answer: string;
      state: "recording";
      chunks: {
        letters: string;
        originalPosition: number;
        originalLetterIndex: number;
        originalLetterIndexEnd: number;
      }[];
    }
  | {
      answer: string;
      state: "guessing" | "finished";
      clipsInOrder: {
        letters: string;
        clip: AudioBuffer;
        originalPosition: number;
        originalLetterIndex: number;
        originalLetterIndexEnd: number;
      }[];
      chunks: { letters: string; originalPosition: number }[];
    };

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  return (
    <div className="App">
      {gameState?.state === "recording" && (
        <ChunkRecorder
          chunks={gameState.chunks}
          recordingFinishedCallback={(data) => {
            (async () => {
              console.log("recording finished callback");
              const orderedClips = data.toSorted(
                (a, b) => a.originalPosition - b.originalPosition
              );
              setGameState({
                ...gameState,
                state: "guessing",
                clipsInOrder: orderedClips,
              });
            })();
          }}
        />
      )}
      {(gameState?.state === "guessing" || gameState?.state === "finished") && (
        <Guessing
          answer={gameState.answer}
          clipsInOrder={gameState.clipsInOrder}
          finishGame={() => {
            setGameState({
              ...gameState,
              state: "finished",
            });
          }}
        />
      )}
      {(gameState === null || gameState.state === "finished") && (
        <NewGame
          startNewGame={(chunkSize, answer) => {
            const chunked = answer
              .split(new RegExp("(.{" + chunkSize.toString() + "})"))
              .filter((O) => O)
              .map((c, index) => ({
                letters: c,
                originalPosition: index,
                originalLetterIndex: index * chunkSize,
                originalLetterIndexEnd: index * chunkSize + chunkSize,
              }));
            setGameState({
              answer,
              chunks: shuffleArray(chunked),
              state: "recording",
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
