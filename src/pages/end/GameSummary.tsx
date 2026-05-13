import { useState } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import type { AnsweredIntervalType } from "../../libs/types";
import { useGameContext } from "../../hooks/useGameContext";
import { intervals, buttons } from "../../utils/constants";
import ButtonPlay from "../../components/game/ButtonPlay";
import Card from "../../components/ui/Card";

export default function GameSummary({ className = [] }: { className?: string[] }) {
    const { game } = useGameContext();
    const [answeredIntervals, setAnsweredIntervals] = useState<AnsweredIntervalType[]>([]);

    useGameEffect({
        onEnter: {
            [GAME_STATES.ENDED]: () => {
                setAnsweredIntervals(Array.from(game.answeredIntervals.values()));
            },
        },
    });

    return (
        <Card title='Vos réponses' className={className}>
            <div className='flex position-relative flex-col gap-2 px-2 w-full'>
                {answeredIntervals.map((item, i) => {
                    const answerIndex = intervals.indexOf(item.answer);
                    const expectedIndex = intervals.indexOf(item.expected);

                    const answer = answerIndex === -1 ? "Non répondu" : buttons[answerIndex];

                    const expected = buttons[expectedIndex];

                    const border = item.correct ? "border-theme-correct" : "border-theme-wrong";
                    const bg = item.correct ? "bg-theme-correct/20" : "bg-theme-wrong/20";

                    const text = item.correct
                        ? "Bien joué ! Vous avez trouvé l'intervalle."
                        : item.answer === "Non répondu"
                          ? "Dommage\u00a0! Vous n'avez pas répondu."
                          : `Dommage\u00a0! Vous avez répondu ${answer}`;

                    return (
                        <div
                            key={item.interval.id}
                            className={`flex flex-col flex-items-start gap-2 p-3 rounded-3 w-full ${bg} border-solid ${border} border-.2`}>
                            <p className='font-bold text-align-start'>
                                Intervalle {i + 1}&nbsp;:{" "}
                                <span dangerouslySetInnerHTML={{ __html: expected }} className='font-500'></span>
                            </p>

                            <div className='flex w-full gap-3 flex-items-center'>
                                <ButtonPlay
                                    size='small'
                                    interval={item.interval}
                                    stateFollowsGame={false}
                                    enabledOnInit={true}
                                />

                                <p dangerouslySetInnerHTML={{ __html: text }} className='text-align-start'></p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
