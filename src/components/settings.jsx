import { useGameContext } from "../hooks/useGameContext";
import { intervals, buttons } from "../utils/constantsMusical";
import CheckBox from "./checkBox";

export function Settings() {

    const { toggleAllowedInterval, allowedIntervals } = useGameContext()

    return <>

        {intervals.map((interval, index) => {
            return <CheckBox key={interval} checked={allowedIntervals.get(index) ? true : false} onChange={() => { toggleAllowedInterval(index) }} label={buttons[index]}></CheckBox>
        })}
    </>
}