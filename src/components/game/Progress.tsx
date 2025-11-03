import { useGameContext } from "../../hooks/useGameContext";
import { useCallback, useState } from "react";
import Game from "../../libs/game";
import { useGameEvent } from "../../hooks/useGameEvent";

export default function Progress() {
    const { game } = useGameContext();

    const [progress, setProgress] = useState(game.currentIntervalIndex + 1);

    const handleProgressChange = useCallback((data: { current: number }) => {
        console.log(data);
        setProgress(data.current + 1);
    }, []);

    useGameEvent(Game.EVENTS.PROGRESS_CHANGED, handleProgressChange);

    return (
        <div className='border-1 border-solid border-slate-100/40 line-height-6  rounded-2  py-1.25 px-2.25 text-center'>
            {progress}/{game.numberOfIntervals}
        </div>
    );
}
