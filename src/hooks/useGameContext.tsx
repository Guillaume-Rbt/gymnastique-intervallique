import { createContext, useContext, useRef } from "react";
import Game from "../libs/game";

type GameContext = {
    game: Game | null;
};

const GameContext = createContext<GameContext>({ game: null });

export function GameContextProvider({ children }: { children: React.ReactNode }) {
    const gameRef = useRef<Game | null>(new Game());

    return <GameContext value={{ game: gameRef.current }}>{children}</GameContext>;
}

export const useGameContext = () => useContext(GameContext);
