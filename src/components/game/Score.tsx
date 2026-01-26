import { useState } from "react";
import { useGameEvent } from "../../hooks/useGameEvent";
import Game from "../../libs/game";
import ScoreIcon from "../../assets/images/score.svg?react";

export default function Score() {
    const [score, setScore] = useState(0);

    useGameEvent(Game.EVENTS.SCORE_CHANGED, (data) => {
        setScore(data.score);
    });

    return (
        <div className='flex rounded-2 py-1.25 px-2.25 border-1 border-theme-light/40 border-solid gap-1 flex-items-center'>
            <ScoreIcon className='text-6' />

            <span>{score}&nbsp;pts</span>
        </div>
    );
}
