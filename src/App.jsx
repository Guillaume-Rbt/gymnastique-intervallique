import { useCallback, useRef, useState, useEffect, useReducer } from "react";
import GameManager from "./libs/gameManager";
import useSoundPlayer from "./hooks/useSoundPlayer";
import { ResponseButtonsMemo } from "./components/responseButtons";
import { Button } from "./components/button";
import { findTimeNotes } from "./libs/SoundPlayer";
import ResponseTimer from "./components/responseTimer";
import "./app.scss";

function App() {
  const gameManager = useRef(new GameManager()).current;
  const [score, setScore] = useState(0);
  const [intervalNumber, setIntervalNumber] = useState(1);
  const player = useSoundPlayer();
  const [timerPaused, setTimerPaused] = useState(true);
  const containerButtonsRef = useRef();
  const buttonMapRef = useRef(new Map());
  const [answerPoints, setAnswerPoints] = useState(5);

  const registerButton = useCallback((response, buttonElement) => {
    buttonMapRef.current.set(response, buttonElement);
  }, []);

  player.on(player.SOUND_END, () => {
    setTimerPaused(false);
  });

  const startGame = useCallback(() => {
    gameManager.startGame();
    setScore(0);
    setIntervalNumber(1);
    player.setIntervalTimes(findTimeNotes(gameManager.getCurrentInterval()));
    player.playInterval();
  }, [gameManager]);

  const next = useCallback(() => {
    const buttonMap = buttonMapRef.current;
    buttonMap.forEach((button) => {
      button.classList.remove("valid", "error");
    });
    if (gameManager.nextInterval()) {
      setIntervalNumber((prev) => prev + 1);
      player.setIntervalTimes(findTimeNotes(gameManager.getCurrentInterval()));
      player.playInterval();
    }
  });

  const handleResponse = useCallback(
    (e) => {
      const userAnswer = e.currentTarget.dataset.value;
      const correctAnswer = gameManager.getCurrentInterval().name;
      const buttonMap = buttonMapRef.current;

      if (userAnswer === correctAnswer) {
        buttonMap.get(userAnswer).classList.add("valid");
        setScore((score) => score + answerPoints);
      } else {
        buttonMap.get(userAnswer)?.classList.add("error");
        buttonMap.get(correctAnswer)?.classList.add("valid");
      }
    },
    [answerPoints],
  );

  return (
    <>
      <header className="game-interval__header">
        {" "}
        <ResponseTimer
          resetToken={intervalNumber}
          onUpdate={setAnswerPoints}
          isPaused={timerPaused}
        ></ResponseTimer>
        <span>{score}</span>
        <span>interval : {intervalNumber}</span>
      </header>

      <ResponseButtonsMemo
        containerRef={containerButtonsRef}
        callback={handleResponse}
        registerButton={registerButton}
      />

      <Button text="Suivant" handleClick={next}></Button>
      <Button text="Start" handleClick={startGame}></Button>
      <Button
        text="Play"
        handleClick={() => {
          player.playInterval();
        }}
      ></Button>
      <pre>{JSON.stringify(gameManager.getCurrentInterval())}</pre>
    </>
  );
}

export default App;
