import { createScope, Scope, utils, createTimeline } from "animejs";
import { useGameContext } from "../../hooks/useGameContext";
import { useLayoutEffect, useRef } from "react";
import { GAME_STATES } from "../../libs/game";
import { useGameEffect } from "../../hooks/useGameEffect";
import Timer from "../ui/Timer";
import Progress from "../game/Progress";
import Score from "../game/Score";
import Settings from "../../pages/Settings";

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
            className='shadow-10 color-slate-200 z-1 overflow-hidden max-sm:gap-5 xs:px-10 text-3 header position-fixed max-xs:flex-justify-center gap-12 sm:gap-10 xs:px-15 z-10  w-full top-0 flex-items-center flex-justify-start flex h-16'>
            <h1 className='font-bold text-4 max-xs:hidden'>Quel est l'intervalle&nbsp;?</h1>

            <div className='grow max-xs:hidden'></div>
            <Timer />
            <Progress />
            <Score />
            <Settings />
        </header>
    );
}
