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

function App() {
  const { startRecording, stopRecording, recordingBlob } = useAudioRecorder();

  const [chunks, setChunks] = useState(["th", "at", "is", "co", "ol"]);

  // const [concatBlobs, setConcatBlobs] = useState(null);
  const [lastBlob, saveLastBlob] = useState<Blob | null>(null);
  const [clipsSoFar, setClipsSoFar] = useState<{ clip: Blob; chunk: string }[]>(
    []
  );
  const [totalBlob, saveTotalBlob] = useState<Blob | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  useEffect(() => {
    const intervalID = setInterval(() => {
      stopRecording();
    }, 500);
    return () => clearInterval(intervalID);
  }, [stopRecording, lastBlob]);

  useEffect(() => {
    if (!recordingBlob || lastBlob === recordingBlob) {
      return;
    }
    saveLastBlob(recordingBlob);
    const newClipsSoFar = [
      ...clipsSoFar,
      { clip: recordingBlob, chunk: chunks.shift()! },
    ];
    setClipsSoFar(newClipsSoFar);
    setChunks(chunks);
    saveTotalBlob(
      new Blob(
        newClipsSoFar.map((a) => a.clip),
        { type: "audio/ogg; codecs=opus" }
      )
    );
  }, [recordingBlob, lastBlob, clipsSoFar, chunks]);

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
                  stopRecording();
                  setExpiryTime(null);
                }}
              />
            )}
            <p>Current chunk is {chunks[0]}</p>
            <button
              onClick={() => {
                setExpiryTime(Date.now() + 5000);
                startRecording();
              }}
            >
              Record
            </button>
            {recordingBlob && (
              <button
                onClick={() => {
                  stopRecording();
                  setExpiryTime(null);
                }}
              >
                Stop
              </button>
            )}
          </>
        )}
        {clipsSoFar.map((clip) => (
          <>
            <p>{clip.chunk}</p>
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
