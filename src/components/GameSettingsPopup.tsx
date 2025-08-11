// GameSettingsPopup.tsx
import { useGameContext, } from "../hooks/useGameContext";
import CheckBox from "../components/CheckBox";
import { buttons } from "../utils/constants";
import { useState } from "react";

export const GameSettingsPopup = ({ Popup, allowedIntervalsRef }: { Popup: any, allowedIntervalsRef: React.RefObject<Map<number, { text: string; enabled: boolean }>> }) => {
    const { allowedIntervals: contextAllowedInterval, checkIfNeedUpdateGame, } = useGameContext();
    const [allowedIntervals, setAllowedIntervals] = useState(contextAllowedInterval);

    const toggleAllowedInterval = (intervalIndex: number) => {

        let updated = allowedIntervals;
        setAllowedIntervals(prev => {
            const interval = prev.get(intervalIndex);
            updated = new Map(prev);
            if (!interval) return prev;
            updated.set(intervalIndex, { ...interval, enabled: !interval.enabled });
            return updated;
        });

        checkIfNeedUpdateGame(updated);
        allowedIntervalsRef.current = updated;
    };



    return (
        <Popup classes="text-3 color-dark-800">
            <>
                <h1 className="text-center m-be-10 font-bold text-5">Paramètres</h1>
                <h2 className="font-bold m-be-1">Choix des intervalles</h2>
             
                <div className="grid w-full lg:grid-cols-3 min-w-[300px] md:grid-cols-2 sm:grid-cols-1 fs-1 gap-2">
                    {buttons.map((button, index) => (
                        <CheckBox
                            key={index}
                            checked={allowedIntervals.get(index)?.enabled}
                            onChange={() => toggleAllowedInterval(index)}
                            label={button}
                        />
                    ))}
                </div>
            </>
        </Popup>
    );
};
