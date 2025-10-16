import { useGameAllowedIntervals } from "../../hooks/useGameAllowedIntervals";
import { buttons } from "../../utils/constants";
import Button, { type ButtonVariant } from "../ui/Button";
import { useLayoutEffect, useRef } from "react";
import { createScope, Scope, utils, createTimeline, stagger } from "animejs";
import { useGameContext } from "../../hooks/useGameContext";
import { GAME_STATES } from "../../libs/game";
import { useGameEffect } from "../../hooks/useGameEffect";
import useBoolean from "../../hooks/useBoolean";

const buttonResponseVariants = {
    default: "bg-theme-dark",
    right: "bg-theme-correct pointer-events-none",
    wrong: "bg-theme-wrong pointer-events-none",
    disabled: "opacity-50 pointer-events-none bg-theme-dark",
};

export default function AnswerButtons() {
    const allowedIntervals = useGameAllowedIntervals();
    const scope = useRef<Scope | null>(null);
    const root = useRef<HTMLDivElement | null>(null);

    const [answered, _, __, toggleAnswered] = useBoolean(false);

    const answerDataRef = useRef<{ correct: boolean; answer: string; expected: string } | null>(null);

    const { animManager, game } = useGameContext();

    const itemRefs = useRef(new Map<string, HTMLElement>());

    const setItemRef = (id: string) => (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
        else itemRefs.current.delete(id);
    };
    useGameEffect({
        onEnter: {
            [GAME_STATES.STARTED]: () => {
                animManager.launch("answer-buttons-enter");
            },
            [GAME_STATES.ANSWERED]: (data) => {
                answerDataRef.current = { correct: data.correct, answer: data.answer, expected: data.expected };
                toggleAnswered();
            },
        },
        onExit: {
            [GAME_STATES.ANSWERED]: () => {
                answerDataRef.current = null;
                toggleAnswered();
            },
        },
    });

    useLayoutEffect(() => {
        scope.current = createScope({ root }).add((_) => {
            if (!root.current) return;

            function init() {
                utils.set([...itemRefs.current.values()], { opacity: 0 });
            }

            function enter() {
                const timeline = createTimeline({
                    defaults: { ease: "outExpo", duration: 300 },
                });

                timeline.add([...itemRefs.current.values()], {
                    opacity: 0.5,
                    delay: stagger(50),
                    onComplete: () => {
                        return {
                            name: "button-completed",
                            callback: (anim: any) => {
                                game.playCurrentInterval();
                                anim.targets.forEach((el: HTMLElement) => {
                                    el.style.removeProperty("opacity");
                                });
                            },
                        };
                    },
                });

                return timeline;
            }

            animManager.register({
                name: "answer-buttons-enter",
                initializer: init,
                executor: enter,
            });
        });
        return () => {
            scope.current?.revert();
            scope.current = null;
            animManager.unregister("answer-buttons-enter");
        };
    }, [animManager]);

    function getVariant(intervalName: string): ButtonVariant {
        let variant: ButtonVariant = "disabled";
        if (game.state === GAME_STATES.WAIT_ANSWER) {
            variant = "default";
        }
        if (answered || answerDataRef.current !== null) {
            if (answerDataRef.current!.answer === intervalName) {
                variant = answerDataRef.current!.correct ? "right" : "wrong";
            }

            if (answerDataRef.current!.expected === intervalName) {
                variant = "right";
            }
        }

        return variant;
    }

    const buttonsList = buttons.map((buttonLabel, index) => {
        const interval = Array.from(allowedIntervals.values())[index];

        const variant = getVariant(interval.text) || "default";

        const isEnabled = interval?.enabled;

        if (!isEnabled) return null;
        return (
            <Button
                ref={setItemRef(interval.text)}
                classes='col-4 btn-shadow hover:bg-theme-dark-hover py-2 px-3 text-3.5 rounded-2'
                key={interval.text}
                label={buttonLabel}
                variant={variant}
                variants={buttonResponseVariants}
                onClick={() => {
                    game.checkAnswer(interval.text);
                }}
            />
        );
    });

    return (
        <div
            ref={root}
            className='color-slate-100 gap-1.5 w-[80%] min-w-[300px] flex flex-wrap flex-justify-center margin-x-auto'>
            {buttonsList}
        </div>
    );
}
