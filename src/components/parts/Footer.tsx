import ButtonPlay from "../game/ButtonPlay";
import Button from "../ui/Button";
import NextIcon from "../../assets/images/next.svg?react";
import { useGameContext } from "../../hooks/useGameContext";
import Volume from "../ui/Volume";

export default function Footer() {
    const { game } = useGameContext();

    return (
        <footer className=' z-10 position-fixed flex  flex-justify-between flex-items-end flex-items-start h-16 bottom-0 w-full'>
            <div className='w-full  flex flex-items-center flex-justify-between bg-opacity-100 h-full px-15 max-xs:px-4'>
                <Volume />
                <ButtonPlay />
                <Button
                    onClick={() => game.nextInterval()}
                    classes='text-5.5 color-slate-100 w-10 h-8 flex flex-items-center flex-justify-center border-1 border-solid border-white/40 bg-white/5 rounded-2 hover:bg-white/20'>
                    <NextIcon />
                </Button>
            </div>
        </footer>
    );
}
