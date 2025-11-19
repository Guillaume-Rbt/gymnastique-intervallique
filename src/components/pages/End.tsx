import { useLayoutEffect, useRef, useState } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "../ui/Button";
import useBoolean from "../../hooks/useBoolean";
import BackIcon from "../../assets/images/back.svg?react";
import ButtonPlay from "../game/ButtonPlay";
import type { Interval } from "../../libs/interval-generator";
import { buttons, intervals } from "../../utils/constants";

export function End() {
    const root = useRef<HTMLDivElement | null>(null);

    const { game } = useGameContext();
    const [resultsShown, showResult, hideResult] = useBoolean(false);
    const [answeredInterval, setAnsweredInterval] = useState<
        Set<{
            id: string;
            answer: string;
            correct: boolean;
            expected: string;
            interval: Interval;
        }>
    >(new Set());

    useLayoutEffect(() => {
        if (!root.current) return;

        root.current.classList.add("opacity-0", "pointer-events-none");
    }, []);

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
                {!resultsShown && (
                    <>
                        <h1 className='text-4xl font-bold'>Gymnastique Intervallique</h1>
                        <p>Partie terminée</p>
                        <div className='flex flex-col'>
                            <p>Vous avez obtenu&nbsp;:</p>
                            <p>{game.score} points</p>
                        </div>{" "}
                        <div className='flex flex-col gap-3 flex-items-stretch'>
                            <Button onClick={showResult} classes={"btn-secondary"} label='Voir les résultats' />
                            <Button classes={"btn-primary"} label='Nouvelle partie' />
                        </div>
                    </>
                )}

                <div className={`w-full h-full flex flex-col ${resultsShown ? "" : "hidden"} gap-6`}>
                    <div className='flex w-full'>
                        <Button
                            onClick={hideResult}
                            classes='text-5.5 color-slate-100 px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-slate-100/40 bg-slate-100/5 rounded-2 hover:bg-white/20'>
                            <BackIcon />
                        </Button>
                    </div>

                    <div className='flex grow overflow-auto scrollbar-hover flex-col flex-items-center'>
                        <h1 className='mb-8 text-8'>Vos réponses</h1>
                        <table className='table-auto text-left border-collapse'>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th className='border border-solid border-slate-100/30 py-3 px-3'>Intervalle</th>
                                    <th className='border border-solid border-slate-100/30 py-3 px-3'>Votre réponse</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...answeredInterval.values()]
                                    .map((item) => {
                                        const answer =
                                            intervals.indexOf(item.answer) == -1
                                                ? "Non répondu"
                                                : buttons[intervals.indexOf(item.answer)];

                                        return {
                                            expected: buttons[intervals.indexOf(item.expected)],
                                            answer: answer,
                                            interval: item.interval,
                                            correct: item.correct,
                                        };
                                    })
                                    .map((item, i) => {
                                        const classes = item.correct ? "color-theme-correct" : "color-theme-wrong";

                                        return (
                                            <tr key={item.interval.id}>
                                                <td className='text-center border border-solid border-slate-100/30 py-2 px-3 vertical-middle'>
                                                    {i + 1}
                                                </td>
                                                <td className='border border-solid border-slate-100/30 py-2 px-3 scroll-snap-start '>
                                                    {" "}
                                                    <ButtonPlay
                                                        size='small'
                                                        interval={item.interval}
                                                        stateFollowsGame={false}
                                                        enabledOnInit={true}
                                                    />
                                                </td>

                                                <td
                                                    className='vertical-middle border border-solid border-slate-100/30 px-3'
                                                    dangerouslySetInnerHTML={{ __html: item.expected }}></td>
                                                <td
                                                    className={`${classes} border border-solid border-slate-100/30 px-3`}
                                                    dangerouslySetInnerHTML={{ __html: item.answer }}></td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
