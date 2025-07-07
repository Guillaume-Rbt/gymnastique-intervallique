import { createContext, useState, useContext, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { intervals } from "../utils/constants";

type IntervalData = { text: string | string[]; enabled: boolean };
type ProgessType = { current: number; total: number };

export enum GAMESTATES {
    INIT = "init",
    READY = "ready",
    STARTED = "started",
    WAIT_ANSWER = "wait",
    ANSWERED = "answered",
    INTERVAL_PLAYED = "interval.played",
    ENDED = "ended",
}

type gameContextType = {
    gameState: GAMESTATES;
    progress: ProgessType;
    setProgress: React.Dispatch<React.SetStateAction<ProgessType>>;
    setGameState: React.Dispatch<React.SetStateAction<GAMESTATES>>;
    allowedIntervals: Map<number, IntervalData>;
    toggleAllowedInterval: (intervalIndex: number) => void;
    commitAllowedIntervals: () => void;
    transitionnalAllowedIntervals: Map<number, IntervalData>;
};

const defaultMap = new Map(intervals.map((interval, index) => [index, { text: interval, enabled: true }]));
const GameContext = createContext<gameContextType>(undefined!);

export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [progress, setProgress] = useState({ current: 1, total: 0 });
    const [gameState, setGameState] = useState<GAMESTATES>(GAMESTATES.INIT);
    const [allowedIntervals, setAllowedIntervals] = useState(defaultMap);
    const [transitionnalAllowedIntervals, setTransitionnalAllowedIntervals] = useState(new Map(defaultMap));

    const transitionRef = useRef(transitionnalAllowedIntervals);
    useEffect(() => {
        transitionRef.current = transitionnalAllowedIntervals;
    }, [transitionnalAllowedIntervals]);

    const commitAllowedIntervals = () => {
        const latest = new Map(transitionRef.current);
        setAllowedIntervals(latest);
    };

    const toggleAllowedInterval = (intervalIndex: number) => {
        setTransitionnalAllowedIntervals(prev => {
            const interval = prev.get(intervalIndex);
            if (!interval) return prev;
            const updated = new Map(prev);
            updated.set(intervalIndex, { ...interval, enabled: !interval.enabled });
            return updated;
        });
    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                setGameState,
                progress,
                setProgress,
                allowedIntervals,
                toggleAllowedInterval,
                commitAllowedIntervals,
                transitionnalAllowedIntervals,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);
