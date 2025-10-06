import { useGameContext } from "./useGameContext";
import Game from "../libs/game";



type GameEvent = Parameters<Game['on']>[0];

export function useGameEvent(event: GameEvent, callack: (data: any) => void) {
    const { game } = useGameContext();


    game.on(event, callack);

    return () => game.off(event, callack);


}