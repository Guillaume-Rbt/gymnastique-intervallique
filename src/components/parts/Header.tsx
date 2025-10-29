import { createScope, Scope, utils, createTimeline } from "animejs";
import { useGameContext } from "../../hooks/useGameContext";
import { useLayoutEffect, useRef } from "react";
import { GAME_STATES } from "../../libs/game";
import { useGameEffect } from "../../hooks/useGameEffect";
import Timer from "../ui/Timer";
import Progress from "../game/Progress";

export default function Header() {
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
        return () => {
            scope.current?.revert();
            scope.current = null;
            animManager.unregister("header-enter");
        };
    }, [animManager]);

    return (
        <header
            ref={root}
            className='shadow-10 color-slate-200 z-1 overflow-hidden sm:gap-10 max-xs:gap-7 xs:px-10 text-3 header position-fixed max-xs:flex-justify-center gap-12 sm:gap-10 max-xs:gap-7 xs:px-10 z-10  w-full top-0 flex-items-center flex-justify-start flex  h-16 before:content-[""] before:position-absolute before:top-0 before:bottom-0  before:left-0 before:right-0 before:m--1 before:opacity-30 before:bg-theme-blue before:filter-blur-20px before:z--1'>
            <h1 className='font-bold text-4'>Quel est l'intervalle&nbsp;?</h1>
            <Timer />
            <Progress />
        </header>
    );
}
