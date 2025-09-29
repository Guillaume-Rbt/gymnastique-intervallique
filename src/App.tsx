import { Header } from "./components/Header";
import Button from "./components/Button";
import Home from "./components/Home";

function App() {
    return (
        <>
            <Home />
            <Header />
            <Button
                classes={[
                    "mt-20",
                    "color-slate-100",
                    "bg-theme-dark",
                    "hover:bg-theme-dark-hover",
                    "py-2",
                    "rounded-2",
                    "btn-shadow",
                ]}
                label='Click Me'
                onClick={() => alert("Button clicked!")}
            />
        </>
    );
}

export default App;
