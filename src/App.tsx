import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useAudioRecorder } from "react-audio-voice-recorder";

function App() {
  const { startRecording, stopRecording, recordingBlob } = useAudioRecorder();

  const [lastBlob, saveLastBlob] = useState<Blob | null>(null);
  const [clipsSoFar, setClipsSoFar] = useState<Blob[]>([]);

  useEffect(() => {
    // if (!recordingBlob || savedClip) return;
    if (!recordingBlob || lastBlob === recordingBlob) {
      return;
    }
    saveLastBlob(recordingBlob);
    setClipsSoFar([...clipsSoFar, recordingBlob]);
  }, [recordingBlob, lastBlob, clipsSoFar]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={startRecording}>Record</button>
        <button onClick={stopRecording}>Stop</button>
        {clipsSoFar.map((clip) => (
          <audio controls src={window.URL.createObjectURL(clip)} />
        ))}
        <p>sdsadsadsa</p>
        {lastBlob && (
          <audio controls src={window.URL.createObjectURL(lastBlob)} />
        )}
        {/* <button onClick={play}>Boop!</button> */}
      </header>
    </div>
  );
}

export default App;
