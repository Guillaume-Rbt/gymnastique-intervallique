import { useCallback, useEffect, useState, useRef } from "react";
import GameManager from "./libs/GameManager";
import Header from "./components/Header";
import Button from "./components/Button";
import { useGameContext, GAMESTATES } from "./hooks/useGameContext";
import { buttons, intervals } from "./utils/constants";
import { useBoolean } from "./hooks/useBoolean";

function App() {
	const { gameState, setGameState, setProgress, allowedIntervals, gameManager } = useGameContext();
	const [answer, setAnswer] = useState<string | null>(null);
	const [userResponse, setUserResponse] = useState<string | null>(null);
	const [timerPaused, setTimerPausedTrue, setTimerPausedFalse] = useBoolean(false);
	const [questionScore, setQuestionScore] = useState(5);
	const [running, setRunningTrue, setRunningFalse] = useBoolean(false);
	const [resetSignal, setResetSignal] = useState(0);
	const [score, setScore] = useState(0);
	const [playerPaused, setPlayerPaused] = useState(true);

	const displaySettingsRef = useRef<{ setIsOpenTrue: () => void } | null>(null);

	const displaySettings = () => {
		console.log(displaySettingsRef.current)
		displaySettingsRef.current?.setIsOpenTrue();
	}


	useEffect(() => {
		const handleGameEnded = () => {
			setGameState(GAMESTATES.ENDED);
			setUserResponse(null);
			setAnswer(null);
		};

		const handleGameStarted = () => {

			setGameState(GAMESTATES.STARTED);
			setProgress(gameManager.getProgress());
			gameManager.playCurrentInterval();

		};

		const handleIntervalEnded = ({ firstPlay }: { firstPlay: boolean }) => {
			if (firstPlay && gameState === GAMESTATES.INTERVAL_PLAYED) {
				handleStartTimer();
				setGameState(GAMESTATES.WAIT_ANSWER);
			}
			setPlayerPaused(true);
		};

		const handleIntervalStarted = () => {
			setGameState(GAMESTATES.INTERVAL_PLAYED);
			setPlayerPaused(false);
		};

		const handleGameReady = () => {
			setGameState(GAMESTATES.READY);
		};

		gameManager.on(GameManager.GAME_ENDED, handleGameEnded);
		gameManager.on(GameManager.GAME_STARTED, handleGameStarted);
		gameManager.on(GameManager.INTERVAL_ENDED, handleIntervalEnded);
		gameManager.on(GameManager.INTERVAL_STARTED, handleIntervalStarted);
		gameManager.once(GameManager.READY, handleGameReady)

		setProgress(gameManager.getProgress());

		return () => {
			gameManager.off(GameManager.GAME_ENDED, handleGameEnded);
			gameManager.off(GameManager.GAME_STARTED, handleGameStarted);
			gameManager.off(GameManager.INTERVAL_ENDED, handleIntervalEnded);
			gameManager.off(GameManager.INTERVAL_STARTED, handleIntervalStarted);
		};
	}, [gameState]);

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
			if (!(gameState == GAMESTATES.WAIT_ANSWER)) return;

			const target = (e.target as HTMLElement).closest("[data-data]") as HTMLElement | null;
			if (!target || !target.dataset.data) return;

			const data = target.dataset.data;
			setTimerPausedTrue();
			setAnswer(gameManager.getCurrentInterval().name);
			setGameState(GAMESTATES.ANSWERED);
			setUserResponse(data);
			if (data === gameManager.getCurrentInterval().name) {
				setScore((prevScore) => prevScore + questionScore);
			}
		},
		[gameManager, gameState, questionScore]
	);

	const handleNext = useCallback(() => {
		if (gameState === GAMESTATES.ANSWERED && gameManager.isLastInterval) {
			setGameState(GAMESTATES.ENDED);
			return;
		}
		setUserResponse(null);
		setAnswer(null);
		gameManager.nextInterval();
		setProgress(gameManager.getProgress());
		handleResetTimer();

		gameManager.playCurrentInterval();
	}, [gameManager, gameState]);

	const buttonList = useCallback(() => {
		const buttons = []
		for (const [index, interval] of allowedIntervals) {
			if (interval.enabled) {
				buttons.push({ text: interval.text, index: index });
			}
		}

		return buttons;

	}, [allowedIntervals])

	return (
		<>
			{(gameState === GAMESTATES.INIT) && <div className="position-fixed w-full h-full bg-white z-999 "></div>}
			{(gameState === GAMESTATES.READY) && <div className="bg-indigo-950 p-bs-10 position-fixed  w-full h-full top-0 z-999 flex flex-col flex-items-center flex-justify-center">
				<h2 className=" font-bold m-inline-auto">GYMNASTIQUE INTERVALLIQUE</h2>
				<p className="m-inline-auto m-block-auto">Formez votre oreille à la reconnaissance d'intervalles</p>
				<Button onClick={() => { displaySettings() }} classes="p-[3px] text-8 bg-transparent hover:bg-gray-200 transition-bg duration-200 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
				</svg></Button>
				<Button
					onClick={() => {
						gameManager.startGame();

					}}
					classes="bg-blue-500 color-white rounded-full p-3 m-inline-auto m-block-auto text-3">
					Commencer
				</Button>
			</div>}
			<Header ref={displaySettingsRef} score={score} running={running} resetSignal={resetSignal} onScoreChange={setQuestionScore} paused={timerPaused} />

			<div className='position-absolute flex flex-col flex-items-center  h-[calc(100%-5rem)] top-18 overflow-scroll p-block-5 flex w-full'>
				<div className='flex flex-items-center flex-justify-center  text-3  flex-col w-full m-auto'>
					<Button
						onClick={() => {
							gameManager.playCurrentInterval();
						}}
						classes={["rounded-full", "p-[4px]", "fs-3", "text-10", "m-be-10", "hover:bg-blue-400", "bg-blue-500", "color-white", "transition-all", "duration-200", "flex-items-center", "flex-justify-center"].join(" ")}>
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
						{buttonList().map((button) => {
							const isDisabled = gameState !== GAMESTATES.WAIT_ANSWER;
							const isUserResponse = userResponse === intervals[button.index];
							const isCorrect = intervals[button.index] === answer;
							const isWrong = isUserResponse && !isCorrect;

							const className = `
  btn-response-${button.index + 1} btn-response
  ${isCorrect ? "right" : ""}
  ${isWrong ? "wrong" : ""}
  ${isDisabled ? "pointer-events-none" : ""}
  ${isDisabled && !isCorrect && !isUserResponse ? "opacity-40" : ""}
`
								.trim()
								.replace(/\s+/g, " ");

							return (
								<Button key={button.index} data={intervals[button.index]} classes={className}>
									{buttons[button.index]}
								</Button>
							);
						})}
						<Button classes={`py-3 px-6 ${gameState == GAMESTATES.ENDED ? "pointer-events-none opacity-40" : ""}`} onClick={handleNext}>
							{gameManager.isLastInterval ? "Terminer" : "Suivant"}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
