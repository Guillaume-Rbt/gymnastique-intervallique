export const buttonVariants = {
    disabled: "opacity-50 pointer-events-none",
    right: "bg-theme-correct opacity-100  pointer-events-none",
    wrong: "bg-theme-wrong opacity-100  pointer-events-none",
    default: "",
};

export default function Button({
    label = "",
    onClick = () => {},
    classes,
    variant = "default",
}: {
    label?: string;
    onClick?: () => void;
    classes: string[] | string;
    variant?: keyof typeof buttonVariants;
}) {
    const buttonsClasses = Array.isArray(classes)
        ? ["cursor-pointer", "btn", ...classes, buttonVariants[variant]]
        : ["cursor-pointer", "btn", classes, buttonVariants[variant]];

    return (
        <button
            dangerouslySetInnerHTML={{ __html: label }}
            className={buttonsClasses.join(" ")}
            onClick={onClick}></button>
    );
}
