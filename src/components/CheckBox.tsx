import { useCallback, useState } from "react";

export default function CheckBox({
    classes = [],
    onChange,
    checked = true,
    label = "",
    id = ""
}: {
    classes?: string[] | string;
    onChange: (arg: number | string) => void;
    checked?: boolean;
    label?: string;
    id?: string | number;
}) {

    const [isChecked, setIsChecked] = useState(checked);
    const defaultClasses = ["flex flex-items-center gap-1"];
    const checkboxClasses = Array.isArray(classes)
        ? [...defaultClasses, ...classes]
        : [classes, ...defaultClasses];

    const onChangeCallback = useCallback(() => {
        onChange(id);

        setIsChecked((prev) => !prev);

    }, [onChange])

    return (
        <label className={checkboxClasses.join(" ")}>
            <input
                type="checkbox"
                onChange={onChangeCallback}
                checked={checked}
                className="hidden"
            />
            <span className="w-3 h-3 rounded-full border-solid border-2 block border-blue relative"><span className={`absolute inset-2 rounded-full bg-blue ${!isChecked ? "hidden" : ""}`}></span></span>
            <span dangerouslySetInnerHTML={{ __html: label }}></span>
        </label >
    );
}