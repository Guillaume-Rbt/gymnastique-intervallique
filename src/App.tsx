import { useCallback, useEffect, useState, useRef } from "react";
import GameManager from "./libs/GameManager";
import Header from "./components/Header";
import Button from "./components/Button";
import { useGameContext, GAMESTATES } from "./hooks/useGameContext";
import { buttons, intervals, buttonsMobile } from "./utils/constants";
import { useBoolean } from "./hooks/useBoolean";

function App() {
	const { gameState, setGameState, setProgress, allowedIntervals, gameManager, device } = useGameContext();
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

		const handleIntervalStarted = ({ firstPlay }: { firstPlay: boolean }) => {
			if (firstPlay) {
				setGameState(GAMESTATES.INTERVAL_PLAYED);

			}
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
			{(gameState === GAMESTATES.INIT) && <div className="position-fixed w-full h-full bg-slate-100 z-999 "></div>}
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
					classes="bg-blue-500 color-slate-100 rounded-full p-3 m-inline-auto m-block-auto text-3">
					Commencer
				</Button>
			</div>}
			{(gameState != GAMESTATES.INIT) && <Header ref={displaySettingsRef} score={score} running={running} resetSignal={resetSignal} onScoreChange={setQuestionScore} paused={timerPaused} />}
			{(gameState !== GAMESTATES.READY && gameState !== GAMESTATES.INIT) && <>


				<div className='position-relative mt-16 flex flex-col flex-items-center  min-h-[calc(100vh-4rem)]  overflow-scroll p-block-5 flex w-full'>
					<div className={`flex flex-items-center flex-justify-center  ${((device.type == "desktop" || device.type == "tablet") && device.width > 942) ? "text-3" : "text-4"}	  flex-col w-full m-auto`}>
						<Button
							onClick={() => {
								gameManager.playCurrentInterval();
							}}
							classes={["rounded-full", "w-13", "h-13", `${playerPaused ? "btn-interactable" : ""}`, "text-8", "m-be-10", "flex-items-center", "flex-justify-center", `${!playerPaused ? "bg-slate-100" : ""}`, `${!playerPaused ? "border-3" : ""}`, `${!playerPaused ? "border-interactable" : ""}`, `${!playerPaused ? "border-solid" : ""}`, `${!playerPaused ? "color-interactable" : ""}`]} >
							<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
								<path fill="currentColor" d="M7.825 21.85L2.15 16.2l4.225-4.225V6.3l11.35 11.325H12.05zm5.075-6.225L8.375 11.1v1.7l-3.4 3.4L7.8 19.025l3.4-3.4zm6.7 1.125l-1.45-1.45q1.125-2.05.788-4.337T16.95 7.025t-3.937-1.987t-4.338.787l-1.45-1.45q2.675-1.7 5.788-1.362T18.375 5.6t2.588 5.363T19.6 16.75m-2.95-2.95l-1.7-1.7q0-.625-.187-1.212t-.613-1.013q-.45-.45-1.037-.65t-1.238-.2l-1.7-1.7Q11.6 6.9 13.05 7.15t2.5 1.3t1.288 2.488t-.188 2.862m-7.7 1.25" />
							</svg>
						</Button>
						<div className='buttons-container mb-4 grid  gap-2' onClick={handleResponse}>
							{buttonList().map((button) => {
								const buttonsText = device.type === "mobile" ? buttonsMobile : buttons;
								const isDisabled = gameState !== GAMESTATES.WAIT_ANSWER;
								const isUserResponse = userResponse === intervals[button.index];
								const isCorrect = intervals[button.index] === answer;
								const isWrong = isUserResponse && !isCorrect;
								const className = `
 btn-response
  ${isCorrect ? "right" : ""}
  ${isWrong ? "wrong" : ""}
  ${isDisabled ? "pointer-events-none" : ""}
  ${isDisabled && !isCorrect && !isUserResponse ? "opacity-40" : ""}
`
									.trim()
									.replace(/\s+/g, " ");

								return (
									<Button key={button.index} data={intervals[button.index]} classes={className}>
										{buttonsText[button.index]}
									</Button>
								);
							})}

						</div>
					</div>
					<Button classes={`rounded-full text-8  w-13 h-13 flex flex-items-center flex-justify-center  btn-interactable font-bold ${gameState == GAMESTATES.ENDED ? "pointer-events-none opacity-40" : ""}`} onClick={handleNext}>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z" />
						</svg>
					</Button>
				</div >


			</>}
		</>
	);
}

export default App;
