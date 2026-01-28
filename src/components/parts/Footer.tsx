import ButtonPlay from "../game/ButtonPlay";
import Button from "../ui/Button";
import NextIcon from "../../assets/images/next.svg?react";
import { useGameContext } from "../../hooks/useGameContext";
import Volume from "../ui/Volume";
import { useLayoutEffect, useRef } from "react";
import { createScope, createTimeline, Scope, utils } from "animejs";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";

export default function Footer() {
    const { game, animManager } = useGameContext();
    const root = useRef<HTMLElement | null>(null);
    const scope = useRef<Scope | null>(null);

    useGameEffect({
        onEnter: {
            [GAME_STATES.STARTED]: () => {
                animManager.launch("footer-enter");
            },
        },
    });

    useLayoutEffect(() => {
        scope.current = createScope({ root: root.current! });

        function footerInit() {
            utils.set(root.current!, { opacity: 0, translateY: "100%" });
        }

        function footerEnter() {
            const timeline = createTimeline({ defaults: { ease: "outExpo", duration: 400 } });

            timeline.add(root.current!, {
                opacity: { from: 0, to: 1 },
                translateY: "0%",
            });
            return timeline;
        }

        animManager.register({
            name: "footer-enter",
            initializer: footerInit,
            executor: footerEnter,
        });
        return () => {
            scope.current?.revert();
            scope.current = null;
            animManager.unregister("footer-enter");
        };
    }, []);

    return (
        <footer
            ref={root}
            className=' z-10 position-fixed flex  flex-justify-between flex-items-end flex-items-start h-16 bottom-0 w-full'>
            <div className='w-full  flex flex-items-center flex-justify-between bg-opacity-100 h-full px-15 max-xs:px-4'>
                <Volume />
                <ButtonPlay />
                <Button
                    onClick={() => {
                        game.nextInterval();
                    }}
                    classes='text-5.5 color-theme-light px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-theme-light/40 bg-theme-light/5 rounded-2 hover:bg-white/20'>
                    <NextIcon />
                </Button>
            </div>
        </footer>
    );
}
