import { createScope, Scope, utils, createTimeline } from "animejs";
import { useGameContext } from "../hooks/useGameContext";
import { useLayoutEffect, useRef } from "react";
import { GAME_STATES } from "../libs/game";
import { useGameEffect } from "../hooks/useGameEffect";
import Timer from "./Timer";
import Progress from "./Progress";

export function Header() {
    const { animManager } = useGameContext();
    const scope = useRef<Scope | null>(null);
    const root = useRef<HTMLDivElement | null>(null);

    useGameEffect({
        onEnter: {
            [GAME_STATES.STARTED]: () => {
                animManager.launch("header-enter");
            },
        },
    });

    useLayoutEffect(() => {
        scope.current = createScope({ root }).add((_) => {
            if (!root.current) return;

            function headerInit() {
                utils.set(root.current!, { opacity: 0, translateY: "-100%" });
            }

            function headerEnter() {
                const timeline = createTimeline({ defaults: { ease: "outExpo", duration: 400 } });

                timeline.add(root.current!, {
                    opacity: { from: 0, to: 1 },
                    translateY: "0%",
                });

                return timeline;
            }

            animManager.register({
                name: "header-enter",
                initializer: headerInit,
                executor: headerEnter,
            });
        });
    }, []);

    return (
        <header
            ref={root}
            className='bg-slate-100 sm:gap-10 max-xs:gap-7 xs:px-10 text-3 header position-fixed max-xs:flex-justify-center gap-12 sm:gap-10 max-xs:gap-7 xs:px-10 z-10 color-dark-800 w-full top-0 flex-items-center flex-justify-start flex bg-slate-100 h-16'>
            <h1 className='font-bold text-4'>Quel est l'intervalle&nbsp;?</h1>
            <Timer />
            <Progress />
        </header>
    );
}
