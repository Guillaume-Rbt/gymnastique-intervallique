import { useEffect } from "react";
import { GameBoard } from "./components/Game/GameBoard";
import { Header } from "./components/parts/Header";
import Home from "./components/displayable/Home";
import { useGameContext } from "./hooks/useGameContext";

function App() {
    const { game } = useGameContext();

    useEffect(() => {
        game.init();
    }, []);

    return (
        <>
            <Home />
            <Header />
            <GameBoard />
        </>
    );
}

export default App;
