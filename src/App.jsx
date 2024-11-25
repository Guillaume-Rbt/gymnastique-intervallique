import { useCallback, useRef, useState, useEffect } from "react";
import GameManager from "./libs/gameManager";
import useSoundPlayer from "./hooks/useSoundPlayer";
import { ResponseButtonsMemo } from "./components/responseButtons";
import { Button } from "./components/button";
import { findTimeNotes } from "./libs/SoundPlayer";
import "./App.css";

function App() {
  const gameManager = useRef(new GameManager()).current;
  const [score, setScore] = useState(0);
  const [intervalNumber, setIntervalNumber] = useState(1);
  const player = useSoundPlayer();
  const containerButtonsRef = useRef();
  const buttonMapRef = useRef(new Map());

  const registerButton = useCallback((response, buttonElement) => {
    buttonMapRef.current.set(response, buttonElement);
  }, []);

  const startGame = useCallback(() => {
    gameManager.startGame();
    setScore(0);
    setIntervalNumber(1);
    player.setIntervalTimes(findTimeNotes(gameManager.getCurrentInterval()));
    player.playInterval();
  }, [gameManager]);

  const next = useCallback(() => {
    if (gameManager.nextInterval()) {
      setIntervalNumber((prev) => prev + 1);
      player.setIntervalTimes(findTimeNotes(gameManager.getCurrentInterval()));
    }
  });

  const handleResponse = useCallback((e) => {
    const userAnswer = e.currentTarget.dataset.value;
    const correctAnswer = gameManager.getCurrentInterval().name; // Exemple, remplace par la réponse correcte dynamique
    const buttonMap = buttonMapRef.current;

    // Réinitialiser les classes
    buttonMap.forEach((button) => {
      button.classList.remove("valid", "error");
    });

    if (userAnswer === correctAnswer) {
      buttonMap.get(userAnswer).classList.add("valid"); // Ajouter la classe 'valid'
    } else {
      buttonMap.get(userAnswer)?.classList.add("error"); // Ajouter la classe 'error'
      buttonMap.get(correctAnswer)?.classList.add("valid"); // Marquer la bonne réponse
    }
  }, []);

  return (
    <>
      <span>interval : {intervalNumber}</span>
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
