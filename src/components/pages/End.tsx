import { useLayoutEffect, useRef, useState } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";

export function End() {
    const root = useRef<HTMLDivElement | null>(null);

    const { game } = useGameContext();
    const [answeredInterval, setAnsweredInterval] = useState<Set<{
        id: string;
        answer: string;
        correct: boolean;
        expected: string;
    }> | null>(null);

    useLayoutEffect(() => {
        if (!root.current) return;

        root.current.classList.add("opacity-100", "pointer-events-none");
    });

    useGameEffect({
        onEnter: {
            [GAME_STATES.ENDED]: () => {
                setAnsweredInterval(game.answeredIntervals);
                root.current?.classList.remove("opacity-0", "pointer-events-none");
            },
        },
    });

    return (
        <div
            ref={root}
            className=' bg-[url(./images/background.webp)] bg-center bg-fixed bg-cover bg-no-repeat text-slate-100 position-fixed w-full h-full bg-theme-blue z-999'>
            <div className='flex flex-col flex-items-center justify-center h-full w-full bg-theme-blue/80 backdrop-blur-3xl gap-6 p-6 text-center'>
                <h1 className='text-4xl font-bold'>Gymnastique Intervallique</h1>

                <p>Partie terminée</p>

                <div className='flex flex-col'>
                    <p>Vous avez obtenu :</p>
                    <p>{game.score} points</p>
                </div>
            </div>
        </div>
    );
}
