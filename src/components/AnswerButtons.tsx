import { useGameAllowedIntervals } from "../hooks/useGameAllowedIntervals";
import { buttons } from "../utils/constants";
import Button from "./Button";
import { useLayoutEffect, useRef, useEffect } from "react";
import { createScope, Scope, utils, createTimeline, stagger } from "animejs";
import { useGameContext } from "../hooks/useGameContext";
import Game, { GAME_STATES } from "../libs/game";

export default function AnswerButtons() {
    const allowedIntervals = useGameAllowedIntervals();
    const scope = useRef<Scope | null>(null);
    const root = useRef<HTMLDivElement | null>(null);

    const { animManager, game } = useGameContext();

    useLayoutEffect(() => {
        scope.current = createScope({ root }).add((_) => {
            if (!root.current) return;

            function init() {
                utils.set("button", { opacity: 0 });
            }

            function enter() {
                const timeline = createTimeline({
                    defaults: { ease: "outExpo", duration: 300 },
                });

                timeline.add("button", { opacity: 1, delay: stagger(50) });

                return timeline;
            }

            animManager.register({
                name: "answer-buttons",
                initializer: init,
                executor: enter,
            });
        });
    }, []);

    useEffect(() => {
        function onGameStarted(data: { state: GAME_STATES }) {
            if (data.state === GAME_STATES.STARTED) {
                animManager.launch("answer-buttons");
            }
        }
        game.once(Game.EVENTS.STATE_CHANGED, (data) => {
            console.log("test");
            onGameStarted(data);
        });
    }, []);

    const buttonsList = buttons.map((buttonLabel, index) => {
        const interval = Array.from(allowedIntervals.values())[index];

        const isEnabled = interval?.enabled;

        if (!isEnabled) return null;

        return (
            <Button
                classes='col-4 btn-shadow bg-theme-dark hover:bg-theme-dark-hover py-2 px-3 text-3.5 rounded-2'
                key={interval.text}
                label={buttonLabel}
            />
        );
    });

    return (
        <div ref={root} className='color-slate-100 gap-1.5 w-[80%] min-w-[300px] flex flex-wrap flex-justify-center'>
            {buttonsList}
        </div>
    );
}
