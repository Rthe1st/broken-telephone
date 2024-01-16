import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { useTimer } from "react-timer-hook";

function TImery(props: { expiryTime: number }) {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called"),
  });
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
            <p>Current chunk is {chunks[0]}</p>
            <button onClick={startRecording}>Record</button>
            <button onClick={stopRecording}>Stop</button>
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
