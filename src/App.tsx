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

async function concatAudioClips(clips: Blob[]): Promise<AudioBuffer> {
  const audioContext = new window.AudioContext();

  const asBuffers = await Promise.all(
    clips.map(
      async (clip) =>
        await audioContext.decodeAudioData(await clip.arrayBuffer())
    )
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
  // start the source playing
  // source.start();
  // new Blob(
  //   orderedClips.map((a) => a.clip),
  //   { type: "audio/ogg; codecs=opus" }
  // )
  return audioBuffer;
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
  const [totalBlob, saveTotalBlob] = useState<AudioBuffer | null>(null);
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
      const a = async () =>
        saveTotalBlob(await concatAudioClips(orderedClips.map((a) => a.clip)));
      a();
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
          <button
            onClick={() => {
              // todo: don't remake this every time
              const audioContext = new window.AudioContext();
              const source = audioContext.createBufferSource();
              // set the buffer in the AudioBufferSourceNode
              source.buffer = totalBlob;
              // connect the AudioBufferSourceNode to the
              // destination so we can hear the sound
              source.connect(audioContext.destination);
              source.start();
            }}
          >
            Play all
          </button>
          // <audio controls src={window.URL.createObjectURL(totalBlob)} />
        )}
      </header>
    </div>
  );
}

export default App;
