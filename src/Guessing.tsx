import { Ref, useRef, useState } from "react";

export function Guessing(props: {
  clipsInOrder: {
    letters: string;
    clip: AudioBuffer;
    originalPosition: number;
    originalLetterIndex: number;
    originalLetterIndexEnd: number;
  }[];
  answer: string;
  finishGame: () => void;
}) {
  const audioContext = new window.AudioContext();
  const currentlyPlayingSources = useRef<AudioBufferSourceNode[]>([]);

  const audioSourcesFactory = (playClipsAfter: boolean) => {
    const sources = props.clipsInOrder.map((clip, index) => {
      const source = audioContext.createBufferSource();
      source.buffer = clip.clip;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (playClipsAfter && index + 1 < props.clipsInOrder.length) {
          setCurrentClip(props.clipsInOrder[index + 1]);
          sources[index + 1].start();
        } else {
          setCurrentClip(null);
        }
      };
      return source;
    });
    currentlyPlayingSources.current = sources;
    setCurrentClip(props.clipsInOrder[0]);
    sources[0].start();
  };

  const cancelPlaying = () => {
    setCurrentClip(null);
    for (const source of currentlyPlayingSources.current) {
      source.onended = () => {};
      // hack because you can only call stop on a source that has started
      // narrow catch or find better way
      try {
        source.stop();
      } catch {}
    }
  };

  const [currentClip, setCurrentClip] = useState<{
    letters: string;
    originalPosition: number;
    originalLetterIndex: number;
    originalLetterIndexEnd: number;
  } | null>(null);

  return (
    <div style={{ paddingTop: "16px" }}>
      <button
        onClick={() => {
          cancelPlaying();
          audioSourcesFactory(true);
        }}
      >
        Listen
      </button>
      {
        <ScoreGuess
          sentence={props.answer}
          finishGame={props.finishGame}
          currentClip={currentClip}
        />
      }
    </div>
  );
}

function GuessInput(props: {
  censoredSentence: string;
  onGuess: (guessText: string) => void;
}) {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const setFocus = (index: number) => {
    if (index < inputRefs.current.length) {
      inputRefs.current[index].focus();
    }
  };

  const censoredWithoutSpaces = props.censoredSentence
    .replaceAll(" ", "")
    .split("");

  const [inputContent, setInputContent] = useState(censoredWithoutSpaces);

  const inputs = censoredWithoutSpaces.map(
    (character: string, index: number) => {
      return (
        <input
          className="hint-guess"
          maxLength={1}
          // placeholder={inputContent[index]}
          value={inputContent[index]}
          ref={(element) => (inputRefs.current[index] = element!)}
          onKeyUp={(event) => {
            const newInputContent = [...inputContent];
            newInputContent[index] = event.key;
            setInputContent(newInputContent);
            setFocus(index + 1);
          }}
          size={1}
        />
      );
    }
  );

  return (
    <div>
      <div>
        {props.censoredSentence.split("").map((character: string) => {
          if (character === " ") {
            return <span className="hint-guess"> </span>;
          } else {
            return inputs.shift();
          }
        })}
      </div>
      <button
        onClick={() => {
          let guess = props.censoredSentence.split("");
          for (const [index, character] of inputContent.entries()) {
            if (character !== " ") {
              guess[index] = character;
            }
          }
          props.onGuess(guess.join(""));
        }}
      >
        Guess
      </button>
    </div>
  );
}

function ScoreGuess(props: {
  finishGame: () => void;
  sentence: string;
  currentClip: {
    letters: string;
    originalPosition: number;
    originalLetterIndex: number;
    originalLetterIndexEnd: number;
  } | null;
}) {
  const { sentence } = props;

  const [guess, setGuess] = useState("");
  const [score, setScore] = useState<{ score: number; outOf: number } | null>(
    null
  );

  const censoredSentence = (guess: string) => {
    const censoredSentence = sentence
      .split(" ")
      .map((word) => "_".repeat(word.length))
      .join(" ");
    let censoredGuess = "";
    let guess2 = guess.replaceAll(" ", "").split("");
    for (const [index, letter] of censoredSentence.split("").entries()) {
      if (letter === " ") {
        censoredGuess += " ";
      } else if (guess2.length > 0) {
        censoredGuess += guess2.shift();
      } else {
        censoredGuess += letter;
      }
    }

    return censoredGuess;
  };

  const styleCorrectLetters = (censoredSentence: string, sentence: string) => {
    return sentence.split("").map((letter, index) => {
      if (letter === " ") {
        return letter;
      } else if (
        censoredSentence.length > index &&
        letter === censoredSentence[index]
      ) {
        return <span style={{ color: "green" }}>{letter}</span>;
      } else {
        return letter;
      }
    });
  };

  const cs = censoredSentence(guess);

  return (
    <div>
      <div className="hint-guess">
        {props.currentClip ? (
          <>
            {cs.substring(0, props.currentClip.originalLetterIndex)}
            <span style={{ backgroundColor: "blue" }}>
              {cs.substring(
                props.currentClip.originalLetterIndex,
                props.currentClip.originalLetterIndexEnd
              )}
            </span>
            {cs.substring(props.currentClip.originalLetterIndexEnd)}
          </>
        ) : (
          cs
        )}
      </div>
      {score !== null ? (
        <div className="score-container">
          <h3>The sentence was:</h3>
          <p className="hint-guess">
            {styleCorrectLetters(censoredSentence(guess), sentence)}
          </p>
          <p>
            Score: {score.score}/{score.outOf}
          </p>
        </div>
      ) : (
        <div className="guess-container">
          {/* <input
            hidden={score !== null}
            onChange={(event) => setGuess(event.target.value)}
            type="text"
            value={guess}
          /> */}
          {score === null && (
            <GuessInput
              censoredSentence={censoredSentence(guess)}
              onGuess={(guessText: string) => {
                setScore(evaluateAnswer(sentence, guessText));
                props.finishGame();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function evaluateAnswer(answer: string, guess: string) {
  const answerWords = answer.replaceAll(" ", "").split("");
  const guessWords = guess.replaceAll(" ", "").split("");

  let score = 0;

  for (const [index, answerWord] of answerWords.entries()) {
    if (index < guessWords.length && answerWord === guessWords[index]) {
      score += 1;
    }
  }

  return {
    score,
    outOf: guess.replaceAll(" ", "").length,
  };
}
