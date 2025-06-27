import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";
import { intervals } from "../utils/constants";


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
    setProgress: Dispatch<SetStateAction<{ current: number, total: number; }>> | (() => {});
    setGameState: Dispatch<SetStateAction<typeof GAMESTATES[keyof typeof GAMESTATES]>> | (() => {});
    allowedIntervals: Map<number, { text: string | string[], enabled: boolean; }>;
    toggleAllowedInterval: (intervalIndex: number) => void;
}

const GameContextDefaultValue = {
    gameState: GAMESTATES.INIT,
    progress: { current: 1, total: 0 },
    setProgress: () => { },
    setGameState: () => { },
    allowedIntervals: new Map(intervals.map((interval, index) => [index, { text: interval, enabled: true }])),
    toggleAllowedInterval: (intervalIndex: number) => {
        console.warn("toggleAllowedInterval function not implemented");
    }
}

const GameContext = createContext(GameContextDefaultValue as gameContextType);




export const GameContextProvider = ({ children }: { children: ReactNode }) => {

    const [progress, setProgress] = useState({ current: 1, total: 0 });
    const [gameState, setGameState] = useState<typeof GAMESTATES[keyof typeof GAMESTATES]>(GAMESTATES.INIT);
    const [allowedIntervals, setAllowedIntervals] = useState(GameContextDefaultValue.allowedIntervals);

    const toggleAllowedInterval = (intervalIndex: number) => {
        setAllowedIntervals((allowedIntervals) => {

            const interval = allowedIntervals.get(intervalIndex)!

            interval.enabled ? allowedIntervals.set(intervalIndex, { ...interval, enabled: false }) : allowedIntervals.set(intervalIndex, { ...interval, enabled: false })

            const newAllowedIntervals = new Map(allowedIntervals)

            return newAllowedIntervals
        })
    }

    return <GameContext.Provider value={{ ...GameContextDefaultValue, progress, setProgress, gameState, setGameState, toggleAllowedInterval, allowedIntervals }}>
        {children}
    </GameContext.Provider>
}


export const useGameContext = () => useContext(GameContext)