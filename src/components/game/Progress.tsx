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
        <div>
            {progress}/{game.numberOfIntervals}
        </div>
    );
}
