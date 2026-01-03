import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@unocss/reset/eric-meyer.css";
import "virtual:uno.css";
import "./index.css";
import App from "./App.tsx";
import { GameContextProvider } from "./hooks/useGameContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <GameContextProvider>
            <App />
        </GameContextProvider>
    </StrictMode>,
);

window.addEventListener("load", () => {
    const loader = document.querySelector(".loader") as HTMLElement;

    if (loader) {
        loader.style.opacity = "0";
    }
});
