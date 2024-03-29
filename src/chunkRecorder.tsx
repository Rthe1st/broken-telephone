import { useEffect, useRef, useState } from "react";

// function convertBlobsToBuffers(clips: Blob[]): Promise<AudioBuffer[]> {
//   const audioContext = new window.AudioContext();

//   return Promise.all(
//     clips.map(async (clip) => {
//       const a = await clip.arrayBuffer();
//       return await audioContext.decodeAudioData(await clip.arrayBuffer());
//     })
//   );
// }

export function ChunkRecorder(props: {
  chunks: {
    letters: string;
    originalPosition: number;
    originalLetterIndex: number;
    originalLetterIndexEnd: number;
  }[];
  recordingFinishedCallback: (
    data: {
      clip: AudioBuffer;
      letters: string;
      originalPosition: number;
      originalLetterIndex: number;
      originalLetterIndexEnd: number;
    }[]
  ) => void;
}) {
  const [started, setStarted] = useState(false);
  const [remainingChunks, setRemainingChunks] = useState(props.chunks);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const recordedData = useRef<
    {
      clip: AudioBuffer;
      letters: string;
      originalPosition: number;
      originalLetterIndex: number;
      originalLetterIndexEnd: number;
    }[]
  >([]);

  const audioContext = new window.AudioContext();

  useEffect(() => {
    setStarted(false);
    setRemainingChunks(props.chunks);
    recordedData.current = [];
  }, [props.chunks]);

  //probably be better to do this outside the component, maybe as a hook?
  useEffect(() => {
    const makeMediaStream = async () => {
      let newMediaRecorder = mediaRecorder;
      if (
        mediaRecorder === null &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        const stream = await navigator.mediaDevices.getUserMedia(
          // constraints - only audio needed for this app
          {
            audio: true,
          }
        );
        newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);
      }
      if (newMediaRecorder !== null) {
        // if (newMediaRecorder.state !== "recording") {
        //   newMediaRecorder.start();
        //   setStarted(true);
        // }
        newMediaRecorder.ondataavailable = async (event: BlobEvent) => {
          console.log("data available");
          if (remainingChunks.length === 0) {
            return;
          }
          // this will be copying a lot of data
          // todo: work out how to append to array instead of making a new one
          recordedData.current.push({
            originalPosition: remainingChunks[0].originalPosition,
            letters: remainingChunks[0].letters,
            clip: await audioContext.decodeAudioData(
              await event.data.arrayBuffer()
            ),
            originalLetterIndex: remainingChunks[0].originalLetterIndex,
            originalLetterIndexEnd: remainingChunks[0].originalLetterIndexEnd,
          });
          setRemainingChunks(remainingChunks.slice(1));
          console.log(remainingChunks.length, recordedData.current.length);
          if (
            newMediaRecorder.state === "inactive" &&
            // remainingChunks.length === 1
            recordedData.current.length === props.chunks.length
          ) {
            // is passing a ref value here safe?
            props.recordingFinishedCallback([...recordedData.current]);
          }
        };
      }
    };
    makeMediaStream();
  }, [mediaRecorder, props, recordedData, remainingChunks]);

  return (
    <div>
      {mediaRecorder && (
        <>
          {!started ? (
            <>
              <h1>
                <div>Say</div>
                <div>the</div>
                <div>sounds</div>
                <div>of</div>
                <div>the</div>
                <div>letters</div>
              </h1>
              <button
                style={{ width: "80%" }}
                onClick={() => {
                  if (mediaRecorder.state !== "recording") {
                    mediaRecorder.start();
                    setStarted(true);
                  }
                }}
              >
                Ready?
              </button>
            </>
          ) : remainingChunks.length === 0 ? (
            <></>
          ) : (
            <>
              {remainingChunks.length > 0 && (
                <p className="chunk">"{remainingChunks[0].letters}"</p>
              )}
              <button
                onClick={() => {
                  if (
                    remainingChunks.length > 0 &&
                    mediaRecorder.state !== "recording"
                  ) {
                    mediaRecorder.start();
                    return;
                  }
                  mediaRecorder.stop();
                  // we'd prefer to use mediaRecorder.requestData()
                  // but the data chunks produced by that, after the first chunk
                  // aren't readable by the audio context - todo: work out why
                  // maybe run the data through an ogg validator?
                  if (remainingChunks.length > 1) {
                    mediaRecorder.start();
                  }
                  //    else if (remainingChunks.length === 1) {
                  //     props.recordingFinishedCallback(recordedData.current);
                  //     return;
                  //   }
                  //   setRemainingChunks(remainingChunks.slice(1));
                }}
              >
                Next
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
