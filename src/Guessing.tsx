import { useState } from "react";

export function Guessing(props: {
  clipsInOrder: {
    letters: string;
    clip: AudioBuffer;
    originalPosition: number;
  }[];
  answer: string;
  finishGame: () => void;
}) {
  const audioContext = new window.AudioContext();

  function createAndPlay(clip: AudioBuffer, index: number) {
    // todo: consider pre-creating the buffers for smoother playback
    const source = audioContext.createBufferSource();
    source.buffer = clip;
    source.connect(audioContext.destination);
    source.onended = () => {
      if (index + 1 < props.clipsInOrder.length) {
        createAndPlay(props.clipsInOrder[index + 1].clip, index + 1);
      }
    };
    source.start();
  }

  return (
    <div style={{ paddingTop: "16px" }}>
      <button
        onClick={() => {
          createAndPlay(props.clipsInOrder[0].clip, 0);
        }}
      >
        Play all
      </button>
      {<ScoreGuess sentence={props.answer} finishGame={props.finishGame} />}
    </div>
  );
}

function ScoreGuess(props: { finishGame: () => void; sentence: string }) {
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

  return (
    <div>
      <div className="hint-guess">{censoredSentence(guess)}</div>
      {score !== null ? (
        <div className="score-container">
          <h3>The sentence was:</h3>
          <p className="hint-guess">
            {styleCorrectLetters(censoredSentence(guess), sentence)}
          </p>
          <h3>You guessed:</h3>
          <p className="hint-guess">{guess}</p>
          <p>
            Score: {score.score}/{score.outOf}
          </p>
        </div>
      ) : (
        <div className="guess-container">
          <input
            hidden={score !== null}
            onChange={(event) => setGuess(event.target.value)}
            type="text"
            value={guess}
          />
          <button
            onClick={() => {
              setScore(evaluateAnswer(sentence, guess));
              props.finishGame();
            }}
          >
            Guess
          </button>
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
