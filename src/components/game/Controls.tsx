import Button from "../ui/Button";
import PlayIcon from "../../assets/images/play.svg?react";
import PauseIcon from "../../assets/images/pause.svg?react";
import useBoolean from "../../hooks/useBoolean";
import { useGameEvent } from "../../hooks/useGameEvent";
import Game from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";

export default function Controls() {
    const { game } = useGameContext();
    const [playing, setPlayingTrue, setPlayingFalse] = useBoolean(false);

    useGameEvent(Game.EVENTS.INTERVAL_PLAYING, setPlayingTrue);
    useGameEvent(Game.EVENTS.INTERVAL_ENDED, setPlayingFalse);
    return (
        <div className='flex'>
            <Button
                onClick={game.playCurrentInterval}
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
                ]}>
                {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
        </div>
    );
}
