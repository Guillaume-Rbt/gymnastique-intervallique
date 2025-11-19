import useBoolean from "../../hooks/useBoolean";

export default function Toogle({
    initialState = false,
    label,
}: {
    initialState?: boolean;
    controlsRef?: any;
    label: string;
}) {
    const [state, setStateOn, setStateOff, toggleState] = useBoolean(initialState);

    const handleClick = () => {
        toggleState();
    };

    return (
        <div className='flex flex-items-center gap-3' onClick={handleClick}>
            <div className='h-7 w-12 border-2 border-solid border-theme-accent rounded-3.5 position-relative cursor-pointer'>
                <span
                    className={`${state ? "bg-theme-accent left-5.5" : "bg-theme-accent/35 left-1"} h-5 w-5 rounded-full position-absolute top-[50%] translate-y-[-50%] transition-all duration-200`}></span>
            </div>
            {label && (
                <span
                    className={`color-slate-100 transition-opacity duration-200 ${state ? "opacity-100" : "opacity-60"}`}>
                    {label}
                </span>
            )}
        </div>
    );
}
