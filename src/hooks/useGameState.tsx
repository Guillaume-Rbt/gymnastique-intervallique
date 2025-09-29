import { useSyncExternalStore } from "react";
import Game from "../libs/game";

const game = new Game();

function subscribe(callback: () => void) {
    game.on(Game.EVENTS.STATE_CHANGED, callback);

    return () => game.off(Game.EVENTS.STATE_CHANGED, callback);
}

function getSnapshot() {
    return game.state;
}

export function useGameState() {
    return useSyncExternalStore(subscribe, getSnapshot);
}
