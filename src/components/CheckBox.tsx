export default function CheckBox({
    classes = [],
    onChange,
    checked = true,
    label = "",
}: {
    classes?: string[] | string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    checked?: boolean;
    label?: string;
}) {
    const defaultClasses = ["checkbox"];
    const checkboxClasses = Array.isArray(classes)
        ? [...defaultClasses, ...classes]
        : [classes, ...defaultClasses];

    return (
        <label className={checkboxClasses.join(" ")}>
            <input
                type="checkbox"
                onChange={onChange}
                checked={checked}
            />
            <span>{label}</span>
        </label>
    );
}