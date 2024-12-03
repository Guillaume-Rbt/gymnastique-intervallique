import { createContext, useContext, useState } from "react";
import { intervals } from "../utils/constantsMusical";



const intervalsMap = new Map(intervals.map((interval, index) => {
    return [index, interval]
}))


const GameContext = createContext({
    allowedIntervals: intervalsMap,
})


export const GameContextProvider = ({ children }) => {
    const [allowedIntervals, setAllowedIntervals] = useState(intervalsMap)
    const [gameState, setGameState] = useState("init")


    const toggleAllowedInterval = (interval) => {
        setAllowedIntervals((allowedIntervals) => {
            allowedIntervals.get(interval) ? allowedIntervals.set(interval, false) : allowedIntervals.set(interval, intervals[interval])

            const newAllowedIntervals = new Map(allowedIntervals)

            return newAllowedIntervals
        })
    }

    return <GameContext.Provider value={{ allowedIntervals, toggleAllowedInterval, setGameState, gameState }}>
        {children}
    </GameContext.Provider>
}

export const useGameContext = () => useContext(GameContext)