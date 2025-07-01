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
    const defaultClasses = ["flex flex-items-center gap-1"];
    const checkboxClasses = Array.isArray(classes)
        ? [...defaultClasses, ...classes]
        : [classes, ...defaultClasses];

    return (
        <label className={checkboxClasses.join(" ")}>
            <input
                type="checkbox"
                onChange={onChange}
                checked={checked}
                className="hidden"
            />
            <span className="w-3 h-3 rounded-full border-solid border-2 block border-blue relative"><span className={`absolute inset-2 rounded-full bg-blue ${!checked ? "hidden" : ""}`}></span></span>
            <span dangerouslySetInnerHTML={{ __html: label }}></span>
        </label >
    );
}