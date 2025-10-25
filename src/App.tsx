import { useEffect } from "react";
import { GameBoard } from "./components/game/GameBoard";
import Header from "./components/parts/Header";
import Home from "./components/pages/Home";
import { useGameContext } from "./hooks/useGameContext";
import Footer from "./components/parts/Footer";

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
            <Footer />
        </>
    );
}

export default App;
