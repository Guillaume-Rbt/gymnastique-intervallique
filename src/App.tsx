import { useEffect } from "react";
import { GameBoard } from "./components/game/GameBoard";
import Header from "./components/parts/Header";
import Home from "./pages/Home";
import { useGameContext } from "./hooks/useGameContext";
import Footer from "./components/parts/Footer";
import { End } from "./pages/End";
import { scormWrapper } from "./libs/scormWrapper";

function App() {
    const { game } = useGameContext();

    useEffect(() => {
        game.init();
        scormWrapper.initialize();
    }, []);

    return (
        <>
            <Home />
            <Header />
            <GameBoard />
            <Footer />
            <End />
        </>
    );
}

export default App;
