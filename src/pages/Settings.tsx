import useBoolean from "../hooks/useBoolean";
import Button from "../components/ui/Button";
import SettingsIcon from "../assets/images/settings.svg?react";
import { createPortal } from "react-dom";
import Toggle from "../components/ui/Toggle";
import { intervals, buttons } from "../utils/constants";
import { useGameContext } from "../hooks/useGameContext";
import { useEffect, useReducer } from "react";
import type { AllowedIntervals } from "../libs/types";
import BackIcon from "../assets/images/back.svg?react";

function reducer(state: AllowedIntervals, action: { type: string; interval: number }): AllowedIntervals {
    const enabledIntervalsNumber = [...state.values()].filter((v) => v.enabled).length;

    if (enabledIntervalsNumber === 3 && action.type === "disable") {
        return state;
    }

    const current = state.get(action.interval);
    if (!current) return state;

    const updated = new Map(state);
    updated.set(action.interval, {
        ...current,
        enabled: action.type === "enable",
    });

    return updated;
}

export default function Settings() {
    const [opened, show, hide] = useBoolean(false);
    const { game } = useGameContext();

    const [allowedIntervals, dispatch] = useReducer(reducer, game.allowedIntervals);

    useEffect(() => {
        if (opened) return;
        game.allowedIntervals = allowedIntervals;
    }, [opened]);

    const toggleList = intervals.map((_, index) => {
        const isEnabled = allowedIntervals.get(index)?.enabled || false;

        return (
            <Toggle
                key={index}
                label={buttons[index]}
                value={isEnabled}
                onChange={(v) => {
                    dispatch({ type: v ? "enable" : "disable", interval: index });
                }}
            />
        );
    });

    const classes = opened ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0";

    return (
        <>
            <Button
                onClick={show}
                classes={
                    "text-5.5 color-slate-100 px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-slate-100/40 bg-slate-100/5 rounded-2 hover:bg-white/20"
                }>
                <SettingsIcon />
            </Button>
            {createPortal(
                <div
                    className={` bg-[url(./images/background.webp)] bg-center bg-fixed bg-cover bg-no-repeat position-fixed transition-opacity  duration-200 top-0 left-0 w-full h-full z-20 ${classes}`}>
                    <div className='w-full flex flex-col  color-slate-100 h-full bg-theme-blue/80 backdrop-blur-3xl p-4'>
                        {" "}
                        <div className='flex w-full '>
                            <Button
                                onClick={hide}
                                classes='text-5.5  px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-slate-100/40 bg-slate-100/5 rounded-2 hover:bg-white/20'>
                                <BackIcon />
                            </Button>
                        </div>
                        <div className='w-230 max-w-[100%] m-x-auto flex grow overflow-auto scrollbar-hover flex-col'>
                            <h2 className='text-8 text-center mb-6 mt-4'>Paramètres</h2>
                            <h3 className='mb-2 text-5'>Sélection des intervalles</h3>
                            <p className='color-slate-100/70 text-3 mb-6'>
                                Vous devez sélectionner au moins trois intervalles.
                            </p>
                            <div className='grid grid-cols-3 gap-2 max-md:grid-cols-2 max-sm:grid-cols-1'>
                                {toggleList}
                            </div>
                        </div>
                    </div>
                </div>,
                document.querySelector("#setting-root")!,
            )}
        </>
    );
}
