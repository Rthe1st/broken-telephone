import { useState } from "react";

export function Guessing(props: {
  recordedAudio: AudioBuffer;
  answer: string;
  finishGame: () => void;
}) {
  return (
    <div>
      <button
        onClick={() => {
          // todo: don't remake this every time
          const audioContext = new window.AudioContext();
          const source = audioContext.createBufferSource();
          // set the buffer in the AudioBufferSourceNode
          source.buffer = props.recordedAudio;
          // connect the AudioBufferSourceNode to the
          // destination so we can hear the sound
          source.connect(audioContext.destination);
          source.start();
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
      <div style={{ letterSpacing: "3px", fontFamily: "monospace" }}>
        {censoredSentence(guess)}
      </div>
      <input
        hidden={score !== null}
        onChange={(event) => setGuess(event.target.value)}
        type="text"
        value={guess}
      />
      {score !== null ? (
        <div>
          <h3>The sentence was:</h3>
          <p>{styleCorrectLetters(censoredSentence(guess), sentence)}</p>
          <h3>You guessed:</h3>
          <p>{guess}</p>
          <p>
            Score: {score.score}/{score.outOf}
          </p>
        </div>
      ) : (
        <button
          onClick={() => {
            setScore(evaluateAnswer(sentence, guess));
            props.finishGame();
          }}
        >
          Guess
        </button>
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
