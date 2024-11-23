import { useCallback, useRef, useState, useEffect } from 'react'
import GameManager from './libs/gameManager'
import useSoundPlayer from './hooks/useSoundPlayer'
import { ResponseButtonsMemo } from './components/responseButtons'
import './App.css'

function App() {
  const gameManager = useRef(new GameManager()).current
  const [score, setScore] = useState(0);
  const [gameSession, setGameSession] = useState(-1);
  const player = useSoundPlayer();
  const containerButtonsRef = useRef();
  const buttonMapRef = useRef(new Map());


  const registerButton = useCallback((response, buttonElement) => {
    buttonMapRef.current.set(response, buttonElement);
  }, []);

  useEffect(() => {
    player.on(player.SOUND_END, () => {
      setCounterPaused(false);
    });
  }, [player]);

  const startGame = useCallback(() => {
    gameManager.startGame()
    setGameSession(1)
    setScore(0)
  }, [gameManager])
  gameManager.startGame()


  const handleResponse = useCallback(
    (e) => {
      const userAnswer = e.target.dataset.value;
      const correctAnswer = gameManager.getCurrentInterval().name; // Exemple, remplace par la réponse correcte dynamique
      const buttonMap = buttonMapRef.current;

      // Réinitialiser les classes
      buttonMap.forEach((button) => {
        button.classList.remove('valid', 'error');
      });


      if (userAnswer === correctAnswer) {
        buttonMap.get(userAnswer).classList.add('valid'); // Ajouter la classe 'valid'
      } else {
        buttonMap.get(userAnswer)?.classList.add('error'); // Ajouter la classe 'error'
        buttonMap.get(correctAnswer)?.classList.add('valid'); // Marquer la bonne réponse
      }
    },
    []
  );

  return (
    <>
      <ResponseButtonsMemo
        containerRef={containerButtonsRef}
        callback={handleResponse}
        registerButton={registerButton}
      />
      {JSON.stringify(gameManager.getCurrentInterval())}
    </>
  )
}

export default App
