import { useEffect, useRef, useState } from "react";

export function ChunkRecorder(props: {
  chunks: { letters: string; originalPosition: number }[];
  recordingFinishedCallback: (
    data: {
      clip: Blob;
      letters: string;
      originalPosition: number;
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
      clip: Blob;
      letters: string;
      originalPosition: number;
    }[]
  >([]);

  useEffect(() => {
    setStarted(false);
    setRemainingChunks(props.chunks);
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
            clip: new Blob([event.data], {
              type: "audio/ogg; codecs=opus",
            }),
          });
          setRemainingChunks(remainingChunks.slice(1));
          if (
            newMediaRecorder.state === "inactive" &&
            remainingChunks.length === 1
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
            <button
              onClick={() => {
                if (mediaRecorder.state !== "recording") {
                  mediaRecorder.start();
                  setStarted(true);
                }
              }}
            >
              Start
            </button>
          ) : remainingChunks.length === 0 ? (
            <></>
          ) : (
            <>
              {remainingChunks.length > 0 && (
                <p>{remainingChunks[0].letters}</p>
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
                {remainingChunks.length === 1 ? "Stop" : "next"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
