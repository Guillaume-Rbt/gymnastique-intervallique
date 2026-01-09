import { createContext, useContext, useRef } from "react";
import Game from "../libs/game";
import { AnimationManager } from "../libs/animations/anim-manager";
import type { GameContext } from "../libs/types";

const GameContext = createContext<GameContext | undefined>(undefined);

export function GameContextProvider({ children }: { children: React.ReactNode }) {
    const gameRef = useRef<Game>(new Game());
    const animManagerRef = useRef<AnimationManager>(new AnimationManager());

    return <GameContext value={{ game: gameRef.current, animManager: animManagerRef.current }}>{children}</GameContext>;
}

export const useGameContext = () => useContext(GameContext) as GameContext;
