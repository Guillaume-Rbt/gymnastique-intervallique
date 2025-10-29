import ButtonPlay from "../game/ButtonPlay";
import Button from "../ui/Button";
import NextIcon from "../../assets/images/next.svg?react";
import { useGameContext } from "../../hooks/useGameContext";
import Volume from "../ui/Volume";

export default function Footer() {
    const { game } = useGameContext();

    return (
        <footer className='p-x-10 bg-theme-blue bg-opacity-25  position-fixed flex overflow-hidden flex-justify-between flex-items-center flex-items-start h-15 bottom-0 w-full'>
            <Volume />
            <ButtonPlay />
            <Button classes='text-6.5 color-slate-100 p-x-8 h-10 border-1 border-solid border-color-theme-accent rounded-5 hover:bg-theme-accent-hover'>
                <NextIcon onClick={() => game.nextInterval()} />
            </Button>
        </footer>
    );
}
