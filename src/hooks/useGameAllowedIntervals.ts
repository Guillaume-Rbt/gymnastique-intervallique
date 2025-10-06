import { useSyncExternalStore } from "react";
import Game from "../libs/game";

const game = new Game();

function subscribe(callback: () => void) {
    game.on(Game.EVENTS.ALLOWED_INTERVALS_CHANGED, callback);

    return () => game.off(Game.EVENTS.ALLOWED_INTERVALS_CHANGED, callback);
}

function getSnapshot() {
    return game.allowedIntervals;
}

export function useGameAllowedIntervals() {
    return useSyncExternalStore(subscribe, getSnapshot);
}
