import type React from "react";
import { useBoolean } from "./useBoolean";


function Popup({
    children,
    isOpen,
    classes = null,
    onClose
}: {
    children?: React.ReactNode;
    isOpen: boolean;
    classes?: string | null;
    onClose: () => void;
}): React.JSX.Element {
    const classesDefault = `${classes ? classes : ""} overlay bg-op-90 bg-dark-100 flex position-fixed top-0 left-0 w-full h-full flex-items-center flex-justify-center z-999 ${isOpen ? "visible" : "invisible"}`;

    return <div onClick={onClose} className={classesDefault}><div className="flex w-[65%] flex-col rounded-4 bg-slate-100 p-4" onClick={(e) => { e.stopPropagation() }}>{children}</div></div>;
}

export function usePopup(
    initialState: boolean = false,
    onClose = () => { }
): [
        (props: { children?: React.ReactNode, classes?: string | null }) => React.JSX.Element,
        () => void,
        () => void,
    ] {
    const [isOpen, setIsOpenTrue, setIsOpenFalse] = useBoolean(initialState);
    const setIsOpenFalseCallback = () => {
        setIsOpenFalse();
        if (onClose) {
            onClose();
        }
    }


   


    const PopupWrapper = ({ children, classes = null }: { children?: React.ReactNode, classes?: string | null }) => (
        <Popup onClose={setIsOpenFalseCallback} classes={classes} isOpen={isOpen}>{children}</Popup>
    );

    return [PopupWrapper, setIsOpenTrue, setIsOpenFalseCallback];
}
