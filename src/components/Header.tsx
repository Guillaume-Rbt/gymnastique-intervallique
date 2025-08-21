import { useGameContext, GAME_STATES } from "../hooks/useGameContext";
import Timer from "./Timer";
import Button from "./Button";
import { useImperativeHandle, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { PopupMemo } from "./Popup";
import { buttons } from "../utils/constants";
import CheckBox from "./CheckBox";

type HeaderProps = {
    score: number;
    onScoreChange: (score: number) => void;
    running: boolean;
    resetSignal: number;
    paused: boolean;
    ref: React.ForwardedRef<{ setIsOpenTrue: () => void }>;
};

export default function Header({ score, onScoreChange, running, resetSignal, paused, ref }: HeaderProps) {

    const { progress, needCommit, commitAllowedIntervals, gameState, allowedIntervals, checkIfNeedUpdateGame } = useGameContext();

    const allowedIntervalsRef = useRef(allowedIntervals);
    const displaySettings = useRef<{
        openSettings: () => void;
    }>(null)



    useImperativeHandle(ref, () => ({
        setIsOpenTrue: () => {
            displaySettings.current?.openSettings();
        }
    }));

    const getAllowedIntervals = () => {
        return allowedIntervalsRef.current;
    };

    const onPopupClose = useCallback(() => {
        checkIfNeedUpdateGame(allowedIntervalsRef.current)
        if (needCommit && gameState !== GAME_STATES.ANSWERED) {
            commitAllowedIntervals(getAllowedIntervals())
        }
    }, [])

    const toggleAllowedInterval = (intervalIndex: number) => {

        const updated = new Map(getAllowedIntervals());

        const interval = updated.get(intervalIndex);

        if (!interval) return;

        updated.set(intervalIndex, { ...interval, enabled: !interval.enabled });

        allowedIntervalsRef.current = updated;
    };




    return <div className="text-3 header position-fixed xs:flex-justify-center gap-15 sm:gap-10 xs:gap-7 sm:px-10 z-10 color-dark-800 w-full top-0 flex-items-center flex-justify-start flex bg-slate-100 h-16 ">
        <p className="font-bold text-4 xs:hidden sm:flex flex-grow">Quel est l'interval ?</p>
        <p>Score : {score}</p>
        <p>{`${progress.current}/${progress.total}`}</p>
        <Timer paused={paused} onScoreChange={onScoreChange} running={running} resetSignal={resetSignal}></Timer>
        <Button onClick={() => displaySettings.current?.openSettings()} classes="p-[3px] text-8 bg-transparent hover:bg-gray-200 transition-bg duration-200 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
        </svg></Button>
        {createPortal(<PopupMemo classes={["color-gray-900"]} onClose={() => onPopupClose()} displaySettingsRef={displaySettings}><>
            <h1 className="text-center m-be-10 font-bold text-5">Paramètres</h1>
            <h2 className="font-bold m-be-3">Choix des intervalles</h2>

            <div className="grid w-full lg:grid-cols-3 min-w-[300px] text-3 md:grid-cols-2 sm:grid-cols-1 fs-1 gap-2">
                {buttons.map((button, index) => (
                    <CheckBox
                        key={index}
                        id={index}
                        checked={allowedIntervalsRef.current.get(index)?.enabled}
                        onChange={() => toggleAllowedInterval(index)}
                        label={button}
                    />
                ))}
            </div>
        </></PopupMemo>, document.querySelector("#root") as HTMLElement)}
    </div >
}