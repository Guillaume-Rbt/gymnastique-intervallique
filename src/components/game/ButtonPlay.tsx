import Button from "../ui/Button";
import PlayIcon from "../../assets/images/play.svg?react";
import PauseIcon from "../../assets/images/pause.svg?react";
import useBoolean from "../../hooks/useBoolean";
import { useGameEvent } from "../../hooks/useGameEvent";
import Game, { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";
import { useCallback } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import type { Interval } from "../../libs/interval-generator";

export default function ButtonPlay({
    size = "big",
    pauseIconWhenPlaying = true,
    interval,
    enabledOnInit = false,
}: {
    size?: "big" | "small";
    pauseIconWhenPlaying?: boolean;
    interval?: Interval;
    enabledOnInit?: boolean;
}) {
    const { game } = useGameContext();
    const [playing, setPlayingTrue, setPlayingFalse] = useBoolean(false);

    const [enabled, enable, disable] = useBoolean(enabledOnInit);

    const handleClickPlay = useCallback(() => {
        if (playing) {
            game.sequencer.clear();
            return;
        }

        if (interval) {
            game.playInterval(interval);
            return;
        }
        game.playCurrentInterval();
    }, [playing]);

    useGameEffect({
        onEnter: {
            [GAME_STATES.WAIT_ANSWER]: () => {
                enable();
            },
        },
        onExit: {
            [GAME_STATES.ANSWERED]: () => {
                disable();
            },
        },
    });

    useGameEvent(Game.EVENTS.INTERVAL_PLAYING, setPlayingTrue);
    useGameEvent(Game.EVENTS.INTERVAL_ENDED, setPlayingFalse);

    const sizeClasses = size === "big" ? ["w-12", "text-7"] : ["w-7", "text-5"];

    return (
        <>
            <Button
                onClick={handleClickPlay}
                classes={[
                    "color-slate-100",
                    "margin-x-auto",
                    "btn-primary",
                    "aspect-square",
                    "p-0",
                    "rounded-full",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                    !enabled ? "opacity-50 pointer-events-none" : "",
                    ...sizeClasses,
                ]}>
                {playing && pauseIconWhenPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
        </>
    );
}
