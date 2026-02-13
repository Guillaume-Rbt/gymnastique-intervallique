import { useLayoutEffect, useRef } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "../../components/ui/Button";
import useBoolean from "../../hooks/useBoolean";
import TrophyIcon from "../../assets/images/trophy.svg?react";
import { scormWrapper } from "../../libs/scormWrapper";
import { createScope, createTimeline, Scope, utils, stagger } from "animejs";
import GameSummary from "./GameSummary";
import Volume from "../../components/ui/Volume";
import LatestGameGraph from "./LatestGameGraph";

export function End() {
    const root = useRef<HTMLDivElement | null>(null);
    const scope = useRef<Scope | null>(null);

    const { game, animManager } = useGameContext();

    const itemsRef = useRef(new Map<string, HTMLElement>());

    const setItemRef = (id: string) => (el: HTMLElement | null) => {
        if (el) itemsRef.current.set(id, el);
        else itemsRef.current.delete(id); // element unmounted -> cleanup
    };
    const [visible, setVisibleTrue, setVisibleFalse] = useBoolean(false);

    useLayoutEffect(() => {
        if (!root.current) return;
        if (scope.current) return;

        scope.current = createScope({ root: root.current }).add((_) => {
            if (!root.current) return;

            function endEnterInit() {
                utils.set(root.current!, { opacity: 0 });

                utils.set([...itemsRef.current.values()], { opacity: 0, translateY: -20 });
            }

            function endEnterPlay() {
                const timeline = createTimeline({
                    defaults: { ease: "outQuad" },
                    onBegin: () => {
                        return {
                            name: "end-enter",
                            callback: () => {
                                setVisibleTrue();
                            },
                        };
                    },
                });

                timeline
                    .add(root.current!, {
                        opacity: [0, 1],
                        duration: 400,
                    })
                    .add(
                        [...itemsRef.current.values()],
                        {
                            opacity: [0, 1],
                            translateY: [-20, 0],
                            duration: 400,
                            delay: stagger(100),
                        },
                        "+=200",
                    );

                return timeline;
            }

            function endExitInit() {
                utils.set(root.current!, { opacity: 1 });
            }

            function endExitPlay() {
                const timeline = createTimeline({
                    defaults: { ease: "outQuad" },
                    onComplete: () => {
                        return {
                            name: "end-exit-end",
                            callback: () => {
                                animManager.getAnimationById("end-enter")?.reset();
                                animManager.getAnimationById("end-exit")?.reset();
                                setVisibleFalse();
                                game.launchSession();
                            },
                        };
                    },
                });
                timeline.add(root.current!, {
                    opacity: [1, 0],
                    duration: 400,
                });
                return timeline;
            }

            animManager.register({
                name: "end-enter",
                initializer: endEnterInit,
                executor: endEnterPlay,
            });

            animManager.register({
                name: "end-exit",
                initOnLaunch: true,
                initializer: endExitInit,
                executor: endExitPlay,
            });
        });

        return () => {
            scope.current?.revert();
            scope.current = null;
            animManager.unregister("end-enter");
            animManager.unregister("end-exit");
        };
    }, []);

    useGameEffect({
        onEnter: {
            [GAME_STATES.ENDED]: () => {
                scormWrapper.saveNewScore(game.score);
                if (game.score > scormWrapper.getScore()) scormWrapper.saveScore(game.score);
                animManager.launch("end-enter");
            },
        },

        onExit: {
            [GAME_STATES.ENDED]: () => {
                animManager.launch("end-exit");
            },
        },
    });

    return (
        <div
            ref={root}
            className={`bg-[image:inherit] bg-center bg-fixed bg-cover bg-no-repeat text-theme-light position-fixed w-full h-full bg-theme-blue z-999 transition-opacity duration-200 ${visible ? "" : "pointer-events-none"}`}>
            <div className='flex flex-col flex-items-center justify-center h-full w-full bg-theme-blue/80 backdrop-blur-3xl gap-10 p-block-6 text-center'>
                {" "}
                <div className='flex flex-col flex-items-center gap-7 h-full w-full'>
                    <h1 ref={setItemRef("title")} className='text-4xl font-bold'>
                        Gymnastique Intervallique
                    </h1>

                    <div className='flex flex-col gap-2 flex-items-center'>
                        <div
                            ref={setItemRef("result")}
                            className='flex flex-col gap-2 text-10 border-1 border-solid border-theme-light p-5 rounded-3 bg-theme-light/10'>
                            <p className='text-4'>Vous avez obtenu&nbsp;:</p>
                            <p>
                                {game.score} point{game.score > 1 ? "s" : ""}
                            </p>
                        </div>
                        {scormWrapper.getScore() > 0 && (
                            <p className='flex flex-items-center gap-3'>
                                <TrophyIcon className='text-7 color-theme-light'></TrophyIcon>
                                <span>
                                    Meilleur score : {scormWrapper.getScore()} point
                                    {scormWrapper.getScore() > 1 ? "s" : ""}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className='h-1 flex gap-4 flex-grow w-full px-10'>
                        {visible && <LatestGameGraph className={["col-2"]}></LatestGameGraph>}

                        <GameSummary className={["col-2"]}></GameSummary>
                    </div>

                    <div className='flex w-full gap-3 px-10'>
                        <Volume></Volume>

                        <div ref={setItemRef("button-new-game")} className='m-inline-auto'>
                            <Button
                                onClick={() => game.reset()}
                                classes={"btn-primary w-full m-inline-auto"}
                                label='Nouvelle partie'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
