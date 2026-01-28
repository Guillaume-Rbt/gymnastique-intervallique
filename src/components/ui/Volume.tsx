import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "./Button";
import useBoolean from "../../hooks/useBoolean";
import VolumeIcon from "../../assets/images/volume.svg?react";
import Mute from "../../assets/images/mute.svg?react";
import Utils from "../../utils/utils";
import { GAME_STATES } from "../../libs/game";

export default function Volume() {
    const { game } = useGameContext();

    const [open, _, setOpenFalse, toggleOpen] = useBoolean(false);

    const [volume, setVolume] = useState(game.sequencer.volume);

    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef<boolean>(false);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
    }, []);

    function handlePointerMove(e: PointerEvent) {
        if (!isDraggingRef.current || !trackRef.current || !thumbRef.current) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        const thumbRect = thumbRef.current.getBoundingClientRect();
        const offsetY = trackRect.bottom - e.clientY;
        const newVolume = Utils.clamp(0, offsetY / (trackRect.height - thumbRect.height), 1);
        setVolume(newVolume);
        game.sequencer.volume = newVolume;
        thumbRef.current.style.bottom = `${newVolume * (trackRect.height - thumbRect.height)}px`;
    }

    function handlePointerUp() {
        isDraggingRef.current = false;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
    }

    useLayoutEffect(() => {
        function handleClickOutside(e: Event) {
            if (!open) return;
            if (
                sliderRef.current &&
                !sliderRef.current.contains(e.target as Node) &&
                game.isAtLeast(GAME_STATES.STARTED)
            ) {
                setOpenFalse();
            }
        }

        document.addEventListener(Utils.EVENTS.DOWN_START, handleClickOutside);

        if (thumbRef.current && trackRef.current) {
            const trackRect = trackRef.current.getBoundingClientRect();
            const thumbRect = thumbRef.current.getBoundingClientRect();
            thumbRef.current.style.bottom = `${volume * (trackRect.height - thumbRect.height)}px`;
        }

        return () => {
            document.removeEventListener(Utils.EVENTS.DOWN_START, handleClickOutside);
        };
    }, [open, volume]);

    return (
        <div className='relative' ref={sliderRef}>
            <Button
                onClick={toggleOpen}
                classes={[
                    "color-theme-light",
                    "margin-x-auto",
                    "text-5.5",
                    "px-2.25",
                    "py-1.25",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                    "hover:bg-white/20",
                    "border-1",
                    "border-solid",
                    "border-white/40",
                    "bg-white/5",
                    "rounded-2",
                    "hover:bg-white/20",
                    `${open ? "bg-white/20" : ""}`,
                ]}>
                {volume > 0 ? <VolumeIcon /> : <Mute />}
            </Button>
            {
                <div
                    className={`absolute top-0 left-[50%] h-30 flex flex-justify-center w-2.5  translate-x-[-50%]  translate-y-[-100%] ${open ? "" : "opacity-0 pointer-events-none "}`}>
                    <div
                        ref={trackRef}
                        className='w-1 h-full rounded-full border-2 border-solid bg-white/20  border-white/40'></div>
                    <div
                        onPointerDown={handlePointerDown}
                        ref={thumbRef}
                        className='w-3.5 h-3.5 border-full translate-x-[-50%] bottom-0 left-[50%] border-3 border-solid border-white bg-theme-accent rounded-full position-absolute'></div>
                </div>
            }
        </div>
    );
}
