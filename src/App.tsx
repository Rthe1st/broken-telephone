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

async function concatAudioClips(clips: Blob[]): Promise<AudioBuffer> {
  const audioContext = new window.AudioContext();

  const asBuffers = await Promise.all(
    clips.map(async (clip) => {
      const a = await clip.arrayBuffer();
      return await audioContext.decodeAudioData(a);
    })
  );

  const length = asBuffers.reduce(
    (totalLength, buffer) => totalLength + buffer.length,
    0
  );
  const numberOfChannels = asBuffers.reduce((numberOfChannels, buffer) => {
    if (numberOfChannels !== buffer.numberOfChannels) {
      throw Error("audio buffers didn't all have same number of channels");
    }
    return numberOfChannels;
  }, asBuffers[0].numberOfChannels);
  const sampleRate = asBuffers.reduce((sampleRate, buffer) => {
    if (sampleRate !== buffer.sampleRate) {
      throw Error("audio buffers didn't all have same number of channels");
    }
    return sampleRate;
  }, asBuffers[0].sampleRate);
  const audioBuffer = audioContext.createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );

  let lengthSoFar = 0;

  for (const buffer of asBuffers) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      audioBuffer.getChannelData(channel).set(channelData, lengthSoFar);
    }
    lengthSoFar += buffer.length;
  }
  return audioBuffer;
}

type GameState =
  | {
      answer: string;
      state: "recording";
      recordedAudio: null;
      chunks: { letters: string; originalPosition: number }[];
    }
  | {
      answer: string;
      state: "guessing" | "finished";
      recordedAudio: AudioBuffer;
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
                recordedAudio: await concatAudioClips(
                  orderedClips.map((a) => a.clip)
                ),
              });
            })();
          }}
        />
      )}
      {(gameState?.state === "guessing" || gameState?.state === "finished") && (
        <Guessing
          answer={gameState.answer}
          recordedAudio={gameState.recordedAudio}
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
              .map((c, index) => ({ letters: c, originalPosition: index }));
            setGameState({
              answer,
              chunks: shuffleArray(chunked),
              state: "recording",
              recordedAudio: null,
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
