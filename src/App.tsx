import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useAudioRecorder } from "react-audio-voice-recorder";

function CountDown(props: { expiryTime: number; onFinished: () => void }) {
  const { expiryTime, onFinished } = props;

  const calculateMSRemaining = (expiryTime: number): number => {
    const now = Date.now();
    if (now > expiryTime) {
      return 0;
    } else {
      return expiryTime - now;
    }
  };

  const [msRemaining, setMSRemaining] = useState(
    calculateMSRemaining(expiryTime)
  );
  const [intervalId, setIntervalId] = useState<any | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = calculateMSRemaining(expiryTime);
      if (newRemainingTime === 0) {
        // if (interval !== null) {
        //   clearInterval(interval);
        // }
        onFinished();
      }
      setMSRemaining(newRemainingTime);
    }, 100);
    setIntervalId(interval);

    return () => clearInterval(interval);
  }, [onFinished, expiryTime]);

  return (
    <div>
      <p>{msRemaining}</p>
    </div>
  );
}

// todo: this is inplace, change that?
function shuffleArray<A>(array: A[]): A[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function App() {
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  const orderedChunks = ["th", "at", "is", "co", "ol"];

  const [chunks, setChunks] = useState<
    { letters: string; originalPosition: number }[]
  >(
    shuffleArray(
      orderedChunks.map((c, index) => ({ letters: c, originalPosition: index }))
    )
  );

  // const [concatBlobs, setConcatBlobs] = useState(null);
  const [lastBlob, saveLastBlob] = useState<Blob | null>(null);
  const [clipsSoFar, setClipsSoFar] = useState<
    { clip: Blob; letters: string; originalPosition: number }[]
  >([]);
  const [totalBlob, saveTotalBlob] = useState<Blob | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  useEffect(() => {
    if (!recordingBlob || lastBlob === recordingBlob || isRecording) {
      return;
    }
    saveLastBlob(recordingBlob);
    const newClipsSoFar = [
      ...clipsSoFar,
      { clip: recordingBlob, ...chunks.shift()! },
    ];
    setClipsSoFar(newClipsSoFar);
    setChunks([...chunks]);
    if (chunks.length === 0) {
      const orderedClips = [...newClipsSoFar].sort(
        (a, b) => a.originalPosition - b.originalPosition
      );
      saveTotalBlob(
        new Blob(
          orderedClips.map((a) => a.clip),
          { type: "audio/ogg; codecs=opus" }
        )
      );
    }
  }, [recordingBlob, lastBlob, clipsSoFar, chunks, isRecording]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {chunks.length > 0 && (
          <>
            {expiryTime && (
              <CountDown
                expiryTime={expiryTime}
                onFinished={() => {
                  if (isRecording) {
                    stopRecording();
                    setExpiryTime(null);
                  }
                }}
              />
            )}
            <p>Current chunk is {chunks[0].letters}</p>
            {isRecording ? (
              <button
                onClick={() => {
                  stopRecording();
                  setExpiryTime(null);
                }}
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => {
                  setExpiryTime(Date.now() + 5000);
                  startRecording();
                }}
              >
                Record
              </button>
            )}
          </>
        )}
        {clipsSoFar.map((clip) => (
          <>
            <p>{clip.letters}</p>
            <audio controls src={window.URL.createObjectURL(clip.clip)} />
          </>
        ))}
        <p>all clips together</p>
        {totalBlob && (
          <audio controls src={window.URL.createObjectURL(totalBlob)} />
        )}
      </header>
    </div>
  );
}

export default App;
