import { useGameAllowedIntervals } from "../../hooks/useGameAllowedIntervals";
import { buttons, buttonsMobile } from "../../utils/constants";
import Button from "../ui/Button";
import { type ButtonVariant } from "../../libs/types";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { createScope, Scope, utils, createTimeline, stagger } from "animejs";
import { useGameContext } from "../../hooks/useGameContext";
import { GAME_STATES } from "../../libs/game";
import { useGameEffect } from "../../hooks/useGameEffect";
import useBoolean from "../../hooks/useBoolean";
import { useDevice } from "../../hooks/useDevice";
import type { JSAnimation, Target } from "animejs";

const buttonResponseVariants = {
    default: " bg-theme-light/10 border-theme-light/40  hover:bg-theme-light/20 hover:border-theme-light/40",
    right: "bg-theme-correct/40 border-theme-correct/60 pointer-events-none",
    wrong: "bg-theme-wrong/40 border-theme-wrong/60 pointer-events-none",
    disabled: "opacity-50 pointer-events-none",
};

export default function AnswerButtons({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
    const allowedIntervals = useGameAllowedIntervals();
    const scope = useRef<Scope | null>(null);
    const [answered, _, __, toggleAnswered] = useBoolean(false);
    const [active, setActiveTrue, setActiveFalse] = useBoolean(false);
    const device = useDevice();

    const buttonsLabel = useMemo(() => {
        return device.type === "mobile" ? buttonsMobile : buttons;
    }, [device.type]);

    const answerDataRef = useRef<{ correct: boolean; answer: string; expected: string } | null>(null);

    const { animManager, game } = useGameContext();

    const itemRefs = useRef(new Map<string, HTMLElement>());

    const setItemRef = (id: string) => (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
        else itemRefs.current.delete(id);
    };
    useGameEffect({
        onEnter: {
            [GAME_STATES.STARTED]: (data) => {
                const { isFirstStart } = data;
                if (!isFirstStart) return;
                animManager.launch("answer-buttons-enter");
            },
            [GAME_STATES.ANSWERED]: (data) => {
                answerDataRef.current = { correct: data.correct, answer: data.answer, expected: data.expected };
                toggleAnswered();
            },
            [GAME_STATES.WAIT_ANSWER]: () => {
                setActiveTrue();
            },
        },
        onExit: {
            [GAME_STATES.ANSWERED]: () => {
                answerDataRef.current = null;
                toggleAnswered();
            },

            [GAME_STATES.WAIT_ANSWER]: () => {
                setActiveFalse();
            },
        },
    });

    useLayoutEffect(() => {
        const root = ref as React.MutableRefObject<HTMLDivElement | null>;

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
                            callback: (anim: JSAnimation) => {
                                game.launchSession();
                                anim.targets.forEach((el: Target) => {
                                    (el as HTMLElement).style.removeProperty("opacity");
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
    }, []);

    const getVariant = useCallback(
        ({
            intervalName,
            active,
            answered,
        }: {
            intervalName: string;
            active: boolean;
            answered: boolean;
        }): ButtonVariant => {
            let variant: ButtonVariant = "disabled";
            if (active) {
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
        },
        [],
    );

    const buttonsList = useMemo(
        () =>
            buttonsLabel.map((buttonLabel, index) => {
                const interval = Array.from(allowedIntervals.values())[index];
                const variant = getVariant({ intervalName: interval.text, active, answered }) || "default";

                const isEnabled = interval?.enabled;

                if (!isEnabled) return null;
                return (
                    <Button
                        ref={setItemRef(interval.text)}
                        classes=' col-4 hover-scale-100  max-lg:col-2 max-xs:col-2 border-solid   border-1 max-xl:col-3  py-2.3 px-2  max-xxl:text-[max(16px,_0.675rem)] text-3.5 rounded-2 font-bold  layer-mobile:[@media(min-width:744px)_and_(max-width:1024px)_and_(orientation:portrait)]:col-1!'
                        key={index}
                        label={buttonLabel}
                        variant={variant}
                        variants={buttonResponseVariants}
                        onClick={() => {
                            game.checkAnswer(interval.text);
                        }}
                    />
                );
            }),
        [allowedIntervals, buttonsLabel, getVariant, active, answered],
    );

    return (
        <div
            ref={ref}
            className='position-relative color-theme-light gap-1.5 max-xs:px-4 px-15 min-w-[300px] flex flex-wrap flex-justify-center margin-x-auto'>
            {buttonsList}
        </div>
    );
}
