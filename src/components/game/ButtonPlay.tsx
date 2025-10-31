import Button from "../ui/Button";
import PlayIcon from "../../assets/images/play.svg?react";
import PauseIcon from "../../assets/images/pause.svg?react";
import useBoolean from "../../hooks/useBoolean";
import { useGameEvent } from "../../hooks/useGameEvent";
import Game, { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";
import { useCallback } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";

export default function ButtonPlay() {
    const { game } = useGameContext();
    const [playing, setPlayingTrue, setPlayingFalse] = useBoolean(false);

    const [enabled, enable, disable] = useBoolean(false);

    const handleClickPlay = useCallback(() => {
        if (playing) {
            game.sequencer.clear();
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

    return (
        <>
            <Button
                onClick={handleClickPlay}
                classes={[
                    "color-slate-100",
                    "margin-x-auto",
                    "text-7",
                    "btn-primary",
                    "p-0",
                    "w-12",
                    "h-12",
                    "rounded-full",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                    !enabled ? "opacity-50 pointer-events-none" : "",
                ]}>
                {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
        </>
    );
}
