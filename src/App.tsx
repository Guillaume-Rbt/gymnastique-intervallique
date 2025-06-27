import { useCallback, useEffect, useRef, useState } from "react";
import GameManager from "./libs/GameManager";
import Header from "./components/Header";
import Button from "./components/Buttons";
import { useGameContext, GAMESTATES } from "./hooks/useGameContext";
import { buttons, intervals } from "./utils/constants";
import { useBoolean } from "./hooks/useBoolean";

function App() {
	const { gameState, setGameState, setProgress } = useGameContext();
	const [answer, setAnswer] = useState<string | null>(null);
	const [isAnswered, setIsAnsweredTrue, setIsAnsweredFalse] = useBoolean(false);
	const [userResponse, setUserResponse] = useState<string | null>(null);
	const [timerPaused, setTimerPausedTrue, setTimerPausedFalse] = useBoolean(false);
	const [questionScore, setQuestionScore] = useState(5);
	const [running, setRunningTrue, setRunningFalse] = useBoolean(false);
	const [resetSignal, setResetSignal] = useState(0); // change this to trigger reset
	const [score, setScore] = useState(0);
	const [playerPaused, setPlayerPaused] = useState(true);

	const gameManagerRef = useRef(new GameManager());
	const gameManager = gameManagerRef.current;

	useEffect(() => {
		const handleGameEnded = () => {
			setGameState(GAMESTATES.ENDED);
			setUserResponse(null);
			setAnswer(null);
		};

		const handleGameStarted = () => {
			setGameState(GAMESTATES.STARTED);
			setProgress(gameManager.getProgress());
		};

		const handleIntervalEnded = ({ firstPlay }: { firstPlay: boolean }) => {
			if (firstPlay && !isAnswered) {
				handleStartTimer();
			}
			setPlayerPaused(true);
		};

		const handleIntervalStarted = () => {
			setPlayerPaused(false);
		};

		gameManager.on(GameManager.GAME_ENDED, handleGameEnded);
		gameManager.on(GameManager.GAME_STARTED, handleGameStarted);
		gameManager.on(GameManager.INTERVAL_ENDED, handleIntervalEnded);
		gameManager.on(GameManager.INTERVAL_STARTED, handleIntervalStarted);
		gameManager.startGame();
		setProgress(gameManager.getProgress());

		return () => {
			gameManager.off(GameManager.GAME_ENDED, handleGameEnded);
			gameManager.off(GameManager.GAME_STARTED, handleGameStarted);
		};
	}, []);

	const handleStartTimer = () => {
		setRunningTrue();
		setTimerPausedFalse();
	};

	const handleResetTimer = () => {
		setRunningFalse();
		setTimerPausedFalse();
		setResetSignal((prev) => prev + 1);
		setQuestionScore(5);
	};

	const handleResponse = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if ((gameState !== GAMESTATES.STARTED && gameState !== GAMESTATES.LAST_INTERVAL) || isAnswered) return;

			const target = (e.target as HTMLElement).closest("[data-data]") as HTMLElement | null;
			if (!target || !target.dataset.data) return;

			const data = target.dataset.data;
			setTimerPausedTrue();
			setAnswer(gameManager.getCurrentInterval().name);
			setIsAnsweredTrue();
			setUserResponse(data);
			if (data === gameManager.getCurrentInterval().name) {
				setScore((prevScore) => prevScore + questionScore);
			}
		},
		[gameManager, gameState, isAnswered, questionScore]
	);

	const handleNext = useCallback(() => {
		if (gameState === GAMESTATES.LAST_INTERVAL) {
			setGameState(GAMESTATES.ENDED);
			return;
		}

		setIsAnsweredFalse();
		setUserResponse(null);
		setAnswer(null);
		gameManager.nextInterval();
		setProgress(gameManager.getProgress());
		handleResetTimer();
		gameManager.playCurrentInterval();
		if (gameManager.isLastInterval && gameState === GAMESTATES.STARTED) {
			setGameState(GAMESTATES.LAST_INTERVAL);
		}
	}, [gameManager, gameState]);

	return (
		<>
			<Header score={score} running={running} resetSignal={resetSignal} onScoreChange={setQuestionScore} paused={timerPaused} />
			<div className='position-absolute flex flex-col flex-items-center  h-[calc(100%-5rem)] top-20 overflow-scroll p-block-8 flex w-full'>
				<div className='flex flex-items-center flex-justify-center  flex-col w-full m-auto'>
					<Button
						onClick={() => {
							gameManager.playCurrentInterval();
						}}
						classes={["rounded-full", "p-1", "fs-3", "text-10", "m-be-10"]}>
						{playerPaused ? (
							<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
								<path fill='currentColor' d='M8 5v14l11-7z' />
							</svg>
						) : (
							<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
								<path fill='currentColor' d='M6 19h4V5H6zm8-14v14h4V5z' />
							</svg>
						)}
					</Button>
					<div className='buttons-container grid  gap-2' onClick={handleResponse}>
						{buttons.map((buttons, index) => {
							const isDisabled = isAnswered || gameState === GAMESTATES.ENDED;
							const isUserResponse = userResponse === intervals[index];
							const isCorrect = intervals[index] === answer;
							const isWrong = isUserResponse && !isCorrect;

							const className = `
  btn-response-${index + 1} btn-response 
  ${isCorrect ? "right" : ""}
  ${isWrong ? "wrong" : ""}
  ${isDisabled ? "pointer-events-none" : ""}
  ${isDisabled && !isCorrect && !isUserResponse ? "opacity-40" : ""}
`
								.trim()
								.replace(/\s+/g, " ");

							return (
								<Button key={buttons.toString()} data={intervals[index]} classes={className} onClick={() => {}}>
									{buttons}
								</Button>
							);
						})}
						<Button classes={`py-4 px-6 ${!isAnswered || gameState == GAMESTATES.ENDED ? "pointer-events-none opacity-40" : ""}`} onClick={handleNext}>
							{gameManager.isLastInterval ? "Terminer" : "Suivant"}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
