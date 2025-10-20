import { useGameContext } from "./useGameContext";
import Game from "../libs/game";
import { useEffect } from "react";

type GameEvent = Parameters<Game["on"]>[0];

export function useGameEvent(event: GameEvent, callback: (data: any) => void) {
    const { game } = useGameContext();

    useEffect(() => {
        game.on(event, callback);

        // cleanup
        return () => {
            game.off(event, callback);
        };
    }, [game, event, callback]);
}
