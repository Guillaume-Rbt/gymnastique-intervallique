import { createContext, useState, useContext, useRef } from "react";
import type { ReactNode } from "react";
import { intervals } from "../utils/constants";
import GameManager from "../libs/GameManager";
import { useBoolean } from "./useBoolean";
import { useDevice, type DeviceType } from "./useDevice";


type IntervalData = { text: string; enabled: boolean };
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
    checkIfNeedUpdateGame: (allowedIntervals: Map<number, IntervalData>) => void;
    commitAllowedIntervals: (allowedIntervals: Map<number, IntervalData>) => void;
    gameManager: GameManager;
    needCommit: boolean;
    device: { type: DeviceType; width: number; ua: string };
};

const defaultMap = new Map(intervals.map((interval, index) => [index, { text: interval, enabled: true }]));
const GameContext = createContext<gameContextType>(undefined!);

export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [progress, setProgress] = useState({ current: 1, total: 0 });
    const [gameState, setGameState] = useState<GAMESTATES>(GAMESTATES.INIT);
    const [allowedIntervals, setAllowedIntervals] = useState(defaultMap);
    const [needCommit, setNeedCommitTrue, setNeedCommitFalse] = useBoolean(false);
    const allowedIntervalsRef = useRef(allowedIntervals);
    const gameManagerRef = useRef(new GameManager({ allowedIntervals }));
    const gameManager = gameManagerRef.current;
    const device = useDevice();

    const handleGameNextInterval = () => {
        if (needCommit) {
            commitAllowedIntervals(allowedIntervalsRef.current);
        }
    }

    gameManager.once(GameManager.REQUEST_NEXT_INTERVAL, handleGameNextInterval);

    const commitAllowedIntervals = (allowedIntervalsFromPopup: Map<number, IntervalData>) => {
        const latest = new Map(allowedIntervalsFromPopup);
        if (gameState !== GAMESTATES.READY)
        {
              gameManager.allowedIntervals = latest;

        }
             setAllowedIntervals(latest); 
        setNeedCommitFalse();
    };

    const checkIfNeedUpdateGame = (allowedIntervalsFromPopup: Map<number, IntervalData>) => {
        const map = allowedIntervalsFromPopup;
        console.log(map)
        if (gameState === GAMESTATES.READY) {
            commitAllowedIntervals(allowedIntervalsFromPopup);
            return;
        }
        for (const [key, value] of map.entries()) {
            if (value.enabled !== allowedIntervals.get(key)?.enabled) {
                allowedIntervalsRef.current = map;
                setNeedCommitTrue();

                return
            }
        }

        setNeedCommitFalse();

        return map;


    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                setGameState,
                progress,
                setProgress,
                allowedIntervals,
                checkIfNeedUpdateGame,
                commitAllowedIntervals,
                gameManager,
                needCommit,
                device
            }}
        >
            {children}

        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);
