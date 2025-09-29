export default function Button({
    label = "",
    onClick = () => {},
    classes,
}: {
    label?: string;
    onClick?: () => void;
    classes: string[] | string;
}) {
    const buttonsClasses = Array.isArray(classes)
        ? ["cursor-pointer", "btn", ...classes]
        : ["cursor-pointer", "btn", classes];

    return (
        <button
            dangerouslySetInnerHTML={{ __html: label }}
            className={buttonsClasses.join(" ")}
            onClick={onClick}></button>
    );
}
