import { useEffect, useState } from "react";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "./Button";

export default function Volume() {
    const { game } = useGameContext();

    const [volume, setVolume] = useState(game.sequencer.volume);

    return (
        <div>
            <Button
                classes={[
                    "color-slate-100",
                    "margin-x-auto",
                    "text-7",
                    "btn-primary",
                    "p-0",
                    "w-12",
                    "h-12",
                    "rounded-full",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                ]}></Button>
        </div>
    );
}
