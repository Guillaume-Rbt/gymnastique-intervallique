import { useGameAllowedIntervals } from "../hooks/useGameAllowedIntervals";
import { buttons } from "../utils/constants";
import Button from "./Button";

export default function AnswerButtons() {
    const allowedIntervals = useGameAllowedIntervals();

    const buttonsList = buttons.map((buttonLabel, index) => {
        const isEnabled = Array.from(allowedIntervals.values())[index]?.enabled;

        if (!isEnabled) return null;

        return (
            <Button
                classes='col-4 btn-shadow bg-theme-dark hover:bg-theme-dark-hover py-2 px-3 text-3.5 rounded-2'
                key={buttonLabel}
                label={buttonLabel}
            />
        );
    });

    return (
        <div className='color-slate-100 gap-1.5 w-[80%] min-w-[300px] flex flex-wrap flex-justify-center'>
            {buttonsList}
        </div>
    );
}
