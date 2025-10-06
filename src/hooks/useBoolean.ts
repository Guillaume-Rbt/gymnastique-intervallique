import { useState, useCallback } from "react";

type UseBooleanReturn = [
    boolean,
    () => void, // setTrue
    () => void, // setFalse
    () => void, // toggle
];

export default function useBoolean(initialValue: boolean = false): UseBooleanReturn {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((prev) => !prev), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return [value, setTrue, setFalse, toggle];
}
