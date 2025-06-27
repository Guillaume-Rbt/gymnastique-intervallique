import { useGameContext } from "../hooks/useGameContext";
import Timer from "./Timer";


type HeaderProps = {
    score: number;
    onScoreChange: (score: number) => void;
    running: boolean;
    resetSignal: number;
    paused: boolean;
};

export default function Header({ score, onScoreChange, running, resetSignal, paused }: HeaderProps) {

    const { progress } = useGameContext();

    return <div className="text-3 header position-fixed xs:flex-justify-center gap-15 sm:gap-10 px-10 z-10 color-dark-800 w-full top-0 flex-items-center flex-justify-start flex bg-white h-16 mb-2">
        <p className="font-bold text-4 xs:hidden sm:flex flex-grow">Quel est l'interval ?</p>
        <p>Score : {score}</p>
        <p>{`${progress.current}/${progress.total}`}</p>
        <Timer paused={paused} onScoreChange={onScoreChange} running={running} resetSignal={resetSignal}></Timer>
    </div>
}