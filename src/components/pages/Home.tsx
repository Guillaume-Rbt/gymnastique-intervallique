import Button from "../ui/Button";
import { useGameContext, type GameContext } from "../../hooks/useGameContext";
import { useLayoutEffect, useRef } from "react";
import { createScope, createTimeline, Scope, utils, stagger } from "animejs";
import { useGameEffect } from "../../hooks/useGameEffect";
import Game from "../../libs/game";

export default function Home() {
    const { game, animManager } = useGameContext() as GameContext;

    const scope = useRef<Scope | null>(null);
    const root = useRef<HTMLDivElement | null>(null);

    //use itemsRef to store refs to multiple elements (bug with scope)
    const itemRefs = useRef(new Map<string, HTMLElement>());

    const setItemRef = (id: string) => (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
        else itemRefs.current.delete(id); // element unmounted -> cleanup
    };

    useGameEffect({
        onEnter: {
            [Game.STATES.READY]: () => {
                animManager.launch("home-enter");
            },
        },
    });

    // register animations
    useLayoutEffect(() => {
        if (!root.current) return;
        if (scope.current) return;

        scope.current = createScope({ root: root.current }).add((_) => {
            if (!root.current) return;

            function homeInit() {
                utils.set(root.current!, { opacity: 0 });

                utils.set([...itemRefs.current.values()], { opacity: 0, translateY: 20 });
            }
            function homeEnter() {
                const timeline = createTimeline({
                    defaults: { ease: "outQuad" },
                });

                timeline
                    .add(root.current!, {
                        opacity: { from: 0, to: 1 },
                    })
                    .add(
                        [...itemRefs.current.values()],
                        {
                            opacity: { from: 0, to: 1 },
                            translateY: 0,
                            delay: stagger(100),
                        },
                        "-=300",
                    );

                return timeline;
            }

            function homeExit() {
                const timeline = createTimeline({
                    defaults: { ease: "outExpo" },
                    onComplete: () => ({
                        name: "home-exit",
                        callback: () => {
                            root.current?.classList.add("pointer-events-none");
                            game.start();
                        },
                    }),
                });
                timeline.add(root.current!, {
                    opacity: { from: 1, to: 0 },
                });
                return timeline;
            }

            animManager.register({
                name: "home-enter",
                initializer: homeInit,
                executor: homeEnter,
            });

            animManager.register({
                name: "home-exit",
                initializer: homeInit,
                executor: homeExit,
            });
        });
        return () => {
            scope.current?.revert();
            scope.current = null;
            animManager.unregister("home-enter");
            animManager.unregister("home-exit");
        };
    }, [game, animManager]);

    const handleStart = () => {
        animManager.launch("home-exit");
    };

    return (
        <div
            ref={root}
            className=' home position-fixed w-full p-7.8 p-be-15 h-full bg-[url(./images/background.webp)] bg-center bg-fixed bg-cover bg-no-repeat z-100 flex flex-items-center flex-col isolate container-margin-y-auto gap-8'>
            <h1 ref={setItemRef("home_title")} className='font-bold text-13 color-slate-100 text-center max-w-86'>
                Gymnastique Intervallique
            </h1>
            <div className='position-absolute backdrop-blur-3xl bg-theme-blue bg-opacity-80  top-0 left-0 w-full h-full z--1'>
                <img
                    src='/images/keyboard.webp'
                    className='mask-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] position-absolute w-full bottom-[8%]'
                />
                <div className='position-absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,var(--colors-theme-blue)_100%)] top-0 left-0'></div>
            </div>
            <p ref={setItemRef("home_sentence")} className='color-slate-100 text-center text-7 max-w-86'>
                Exercez votre oreille à la reconnaissance d'intervalles
            </p>
            <div ref={setItemRef("home_button")}>
                {" "}
                <Button label='Commencer' onClick={handleStart} classes={["btn-primary", "mt-20"]} />
            </div>
        </div>
    );
}
