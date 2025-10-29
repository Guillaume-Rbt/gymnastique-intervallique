import { useEffect, useRef, useState } from "react";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "./Button";
import useBoolean from "../../hooks/useBoolean";
import VolumeIcon from "../../assets/images/volume.svg?react";
import Utils from "../../utils/utils";

export default function Volume() {
    const { game } = useGameContext();

    const [open, _, setOpenFalse, toggleOpen] = useBoolean(false);

    const [volume, setVolume] = useState(game.sequencer.volume);

    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(e: Event) {
            if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
                setOpenFalse();
            }
        }

        document.addEventListener(Utils.EVENTS.DOWN_START, handleClickOutside);

        return () => {
            document.removeEventListener(Utils.EVENTS.DOWN_START, handleClickOutside);
        };
    }, []);

    return (
        <div className='relative' ref={sliderRef}>
            <Button
                onClick={toggleOpen}
                classes={[
                    "color-slate-100",
                    "margin-x-auto",
                    "text-6.5",
                    "p-0",
                    "w-10",
                    "h-10",
                    "rounded-full",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                ]}>
                <VolumeIcon />
            </Button>
            <div className='absolute top-[100%] left-[50%] w-40 flex  translate-x-[-50%] p-y-4 px-6'>
                <div className='w-full h-2 rounded-full border-2 border-solid  border-gray-800'></div>
            </div>
        </div>
    );
}
