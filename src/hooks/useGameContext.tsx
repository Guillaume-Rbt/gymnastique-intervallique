import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";


type ProgessType = {
    current: number;
    total: number;
}
export enum GAMESTATES {
    INIT = "init",
    STARTED = "started",
    LAST_INTERVAL = "last.interval",
    ENDED = "ended"
}

type gameContextType = {
    gameState: typeof GAMESTATES[keyof typeof GAMESTATES];
    progress: ProgessType;
    setProgress: Dispatch<SetStateAction<{ current: number; total: number; }>> | (() => {});
    setGameState: Dispatch<SetStateAction<typeof GAMESTATES[keyof typeof GAMESTATES]>> | (() => {});
}



const GameContext = createContext({
    gameState: GAMESTATES.INIT,
    progress: { current: 1, total: 0 },
    setProgress: () => { },
    setGameState: () => { }
} as gameContextType);




export const GameContextProvider = ({ children }: { children: ReactNode }) => {

    const [progress, setProgress] = useState({ current: 1, total: 0 });
    const [gameState, setGameState] = useState<typeof GAMESTATES[keyof typeof GAMESTATES]>(GAMESTATES.INIT);

    return <GameContext.Provider value={{
        gameState: gameState,
        progress: progress,
        setProgress: setProgress,
        setGameState: setGameState
    }}>
        {children}
    </GameContext.Provider>
}


export const useGameContext = () => useContext(GameContext)