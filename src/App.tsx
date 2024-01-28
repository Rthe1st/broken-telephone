import { useEffect, useState } from "react";
import "./App.css";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { ChunkRecorder } from "./chunkRecorder";

function chooseSentence() {
  const sentences = [
    "He played the game as if his life depended on it and the truth was that it did",
    "It's a skateboarding penguin with a sunhat!",
    "Each person who knows you has a different perception of who you are",
    "It took me too long to realize that the ceiling hadn't been painted to look like the sky",
    "They desperately needed another drummer since the current one only knew how to play bongos",
    "If you spin around three times, you'll start to feel melancholy",
    "Garlic ice-cream was her favorite",
    "He found the chocolate covered roaches quite tasty",
    "They say that dogs are man's best friend, but this cat was setting out to sabotage that theory",
    "Everyone was curious about the large white blimp that appeared overnight",
    "That is an appealing treasure map that I can't read",
    "Greetings from the real universe",
    "He was willing to find the depths of the rabbit hole in order to be with her",
    "The near-death experience brought new ideas to light",
    "The skeleton had skeletons of his own in the closet",
    "She was only made the society president because she can whistle with her toes",
    "The tart lemonade quenched her thirst, but not her longing",
    "Siri became confused when we reused to follow her directions",
    "I think I will buy the red car, or I will lease the blue one",
    "Today we gathered moss for my uncle's wedding",
    "His thought process was on so many levels that he gave himself a phobia of heights",
    "I would be delighted if the sea were full of cucumber juice",
    "The sunblock was handed to the girl before practice, but the burned skin was proof she did not apply it",
    "I purchased a baby clown from the Russian terrorist black market",
    "Nancy decided to make the porta-potty her home",
    "The golden retriever loved the fireworks each Fourth of July",
    "He watched the dancing piglets with panda bear tummies in the swimming pool",
    "The sign said there was road work ahead so he decided to speed up",
    "He decided water-skiing on a frozen lake wasn’t a good idea",
    "Douglas figured the best way to succeed was to do the opposite of what he'd been doing all his life",
    "While on the first date he accidentally hit his head on the beam",
    "Charles ate the french fries knowing they would be his last meal",
    "The truth is that you pay for your lifestyle in hours",
    "Best friends are like old tomatoes and shoelaces",
    "Although it wasn't a pot of gold, Nancy was still enthralled at what she found at the end of the rainbow",
    "He liked to play with words in the bathtub",
    "The blue parrot drove by the hitchhiking mongoose",
    "I can't believe this is the eighth time I'm smashing open my piggy bank on the same day!",
    "The light that burns twice as bright burns half as long",
    "Baby wipes are made of chocolate stardust",
    "He had reached the point where he was paranoid about being paranoid",
    "Pink horses galloped across the sea",
    "The doll spun around in circles in hopes of coming alive",
    "The spa attendant applied the deep cleaning mask to the gentleman’s back",
    "As he waited for the shower to warm, he noticed that he could hear water change temperature",
    "Sometimes you have to just give up and win by cheating",
    "The Great Dane looked more like a horse than a dog",
    "The random sentence generator generated a random sentence about a random sentence",
    "The fish dreamed of escaping the fishbowl and into the toilet where he saw his friend go",
    "The bullet pierced the window shattering it before missing Danny's head by mere millimeters",
    "The view from the lighthouse excited even the most seasoned traveler",
    "There have been days when I wished to be separated from my body, but today wasn’t one of those days",
    "The shark-infested South Pine channel was the only way in or out",
    "She felt that chill that made the hairs on the back of her neck stand up when he walked into the room",
    "Nancy was proud that she ran a tight shipwreck",
    "He's in a boy band which doesn't make much sense for a snake",
    "The hand sanitizer was actually clear glue",
    "He was an introvert that extroverts seemed to love",
    "The elephant didn't want to talk about the person in the room",
    "They finished building the road they knew no one would ever use",
    "Situps are a terrible way to end your day",
    "Nancy thought the best way to create a welcoming home was to line it with barbed wire",
    "The best key lime pie is still up for debate",
    "He found a leprechaun in his walnut shell",
    "He looked behind the door and didn't like what he saw",
    "She did not cheat on the test, for it was not the right thing to do",
    "100 years old is such a young age if you happen to be a bristlecone pine",
    "It took me too long to realize that the ceiling hadn't been painted to look like the sky",
    "The blinking lights of the antenna tower came into focus just as I heard a loud snap",
    "He found rain fascinating yet unpleasant",
    "The thunderous roar of the jet overhead confirmed her worst fears",
    "When he asked her favorite number, she answered without hesitation that it was diamonds",
    "It must be five o'clock somewhere",
    "Check back tomorrow; I will see if the book has arrived",
    "He wore the surgical mask in public not to keep from catching a virus, but to keep people away from him",
    "She opened up her third bottle of wine of the night",
    "I ate a sock because people on the Internet told me to",
    "The worst thing about being at the top of the career ladder is that there's a long way to fall",
    "Mom didn’t understand why no one else wanted a hot tub full of jello",
    "On each full moon",
    "He ended up burning his fingers poking someone else's fire",
    "The light in his life was actually a fire burning all around him",
    "Even though he thought the world was flat he didn’t see the irony of wanting to travel around the world",
    "Gwen had her best sleep ever on her new bed of nails",
    "She looked into the mirror and saw another person",
    "It's never been my responsibility to glaze the donuts",
    "He said he was not there yesterday; however, many people saw him there",
    "I'd always thought lightning was something only I could see",
    "The mysterious diary records the voice",
    "That must be the tenth time I've been arrested for selling deep-fried cigars",
    "She had convinced her kids that any mushroom found on the ground would kill them if they touched it",
    "It isn't true that my mattress is made of cotton candy",
    "The spa attendant applied the deep cleaning mask to the gentleman’s back",
    "He stomped on his fruit loops and thus became a cereal killer",
    "I used to live in my neighbor's fishpond, but the aesthetic wasn't to my taste",
    "Car safety systems have come a long way, but he was out to prove they could be outsmarted",
    "Greetings from the real universe",
    "She did a happy dance because all of the socks from the dryer matched",
    "I love bacon, beer, birds, and baboons",
    "Most shark attacks occur about 10 feet from the beach since that's where the people are",
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
}

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
      <p>Seconds left: {Math.round(msRemaining / 100) / 10}</p>
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

function App() {
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  // const orderedChunks = ["th", "at", "is", "co", "ol"];
  const [chunkSize, setChunkSize] = useState(2);
  const [chunks, setChunks] = useState<
    { letters: string; originalPosition: number }[]
  >([]);

  const [sentence, setSentence] = useState<string | null>(null);
  const [showSentence, setShowSentence] = useState(false);

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
      const orderedClips = [...newClipsSoFar].toSorted(
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
        {chunks.length > 0 && (
          <ChunkRecorder
            chunks={chunks}
            recordingFinishedCallback={(data) => {
              (async () => {
                const orderedClips = data.toSorted(
                  (a, b) => a.originalPosition - b.originalPosition
                );
                saveTotalBlob(
                  await concatAudioClips(orderedClips.map((a) => a.clip))
                );
              })();
            }}
          />
        )}
        <input
          onChange={(value) =>
            setChunkSize(Number.parseInt(value.target.value))
          }
          type="number"
          value={chunkSize}
        />
        <button
          style={{ fontSize: 25 }}
          onClick={() => {
            const newSentence = chooseSentence();
            setSentence(newSentence);
            const chunked = newSentence
              .split(new RegExp("(.{" + chunkSize.toString() + "})"))
              .filter((O) => O)
              .map((c, index) => ({ letters: c, originalPosition: index }));
            setChunks(shuffleArray(chunked));
            setClipsSoFar([]);
            saveTotalBlob(null);
            setExpiryTime(null);
            saveLastBlob(null);
            setShowSentence(false);
          }}
        >
          New sentence
        </button>
        {totalBlob && (
          <>
            <p>all clips together</p>
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
          </>
        )}
        <div>
          {sentence === null ? (
            <></>
          ) : (
            <button
              style={{ fontSize: 25 }}
              onClick={() => {
                setShowSentence(!showSentence);
              }}
            >
              {showSentence ? "Hide" : "Show"} sentence
            </button>
          )}
          {showSentence && <p>{sentence}</p>}
        </div>
      </header>
    </div>
  );
}

export default App;
