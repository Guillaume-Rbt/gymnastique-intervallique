import { useCallback, useEffect, useRef, useState } from "react";
import GameManager from "./libs/GameManager";
import Header from "./components/Header";
import Button from "./components/Buttons";
import { useGameContext, GAMESTATES } from "./hooks/useGameContext";
import { buttons, intervals } from "./utils/constants";

function App() {
  const { gameState, setGameState, setProgress } = useGameContext();


  const [answer, setAnswer] = useState<string | null>(null);
  const [isAnswered, setAnswered] = useState<boolean>(false);
  const [userResponse, setUserResponse] = useState<string | null>(null);
  const gameManagerRef = useRef(new GameManager());
  const gameManager = gameManagerRef.current;



  useEffect(() => {

    const handleGameEnded = () => {
      setGameState(GAMESTATES.ENDED);
      setUserResponse(null);
      setAnswer(null);
    }

    const handleGameStarted = () => {
      setGameState(GAMESTATES.STARTED);
      setProgress(gameManager.getProgress());
    }

    gameManager.on(GameManager.GAME_ENDED, handleGameEnded)
    gameManager.on(GameManager.GAME_STARTED, handleGameStarted)
    gameManager.startGame();
    setProgress(gameManager.getProgress());

    return () => {
      gameManager.off(GameManager.GAME_ENDED, handleGameEnded);
      gameManager.off(GameManager.GAME_STARTED, handleGameStarted)
    }
  }, []);



  const handleResponse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState !== GameManager.GAME_STARTED || isAnswered) return;

      const target = (e.target as HTMLElement).closest('[data-data]') as HTMLElement | null;
      if (!target || !target.dataset.data) return;

      const data = target.dataset.data;
      setAnswer(gameManager.getCurrentInterval().name);
      setAnswered(true);
      setUserResponse(data);
    },
    [gameManager, gameState, isAnswered]
  );


  const handleNext = useCallback(() => {
    if (gameManager.isLastInterval && gameState === GameManager.GAME_ENDED) {
      return
    }
    setAnswered(false);
    setUserResponse(null);
    setAnswer(null);
    gameManager.nextInterval();
    setProgress(gameManager.getProgress());
  }, [gameManager])



  return (
    <>
      <Header />
      <div className="game-container position-absolute h-[calc(100%-5rem)] top-20 overflow-scroll p-block-8 flex w-full">
        <div className="buttons-container grid  gap-2 m-auto" onClick={handleResponse}>
          {buttons.map((buttons, index) => {
            const isDisabled = isAnswered || gameState === GameManager.GAME_ENDED;
            const isUserResponse = userResponse === intervals[index];
            const isCorrect = intervals[index] === answer;
            const isWrong = isUserResponse && !isCorrect;

            const className = `
  btn-response-${index + 1} btn-response 
  ${isCorrect ? 'right' : ''}
  ${isWrong ? 'wrong' : ''}
  ${isDisabled ? 'pointer-events-none' : ''}
  ${(isDisabled && !isCorrect && !isUserResponse) ? 'opacity-40' : ''}
`.trim().replace(/\s+/g, ' ');

            return (
              <Button
                key={buttons.toString()}
                data={intervals[index]}
                classes={className}
                onClick={() => { }} // inutile ici, on délègue au parent
              >
                {buttons}
              </Button>
            );



          })}

          <Button classes={`${!isAnswered || gameState == GameManager.GAME_ENDED ? "pointer-events-none opacity-40" : ""}`} onClick={handleNext} >{gameManager.isLastInterval ? "Terminer" : "Suivant"}</Button>

        </div>
      </div>
    </>
  );
}

export default App;
