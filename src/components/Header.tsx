import { useGameContext } from "../hooks/useGameContext";
import Timer from "./Timer";


type HeaderProps = {
    score: number;
    onScoreChange: (score: number) => void;
    running: boolean;
    resetSignal: number;
};

export default function Header({score, onScoreChange, running, resetSignal}: HeaderProps) {

    const { progress } = useGameContext();




    return <div className="header position-fixed z-10 color-dark-800 w-full top-0 flex-items-center flex-justify-evenly flex bg-white h-20 mb-2">
        <p>Score : {score}</p>
        <p>{`${progress.current}/${progress.total}`}</p>
            <Timer paused={true} onScoreChange={onScoreChange} running={running} resetSignal={resetSignal}></Timer>
    </div>
}