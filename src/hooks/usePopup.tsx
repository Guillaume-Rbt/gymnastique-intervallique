import type React from "react";
import { useBoolean } from "./useBoolean";
import { useCallback } from "react";

function Popup({
    children,
    isOpen,
    onClose
}: {
    children?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}): React.JSX.Element {
    const classes = `overlay bg-op-90 bg-dark-100 flex position-fixed top-0 left-0 w-full h-full flex-items-center flex-justify-center z-50 ${isOpen ? "visible" : "invisible"}`;

    return <div onClick={onClose} className={classes}><div className="flex w-[65%] flex-col rounded-4 bg-white p-4" onClick={(e) => { e.stopPropagation() }}>{children}</div></div>;
}

export function usePopup(
    initialState: boolean = false,
    onClose = () => { }
): [
        (props: { children?: React.ReactNode }) => React.JSX.Element,
        () => void,
        () => void,
    ] {
    const [isOpen, setIsOpenTrue, setIsOpenFalse] = useBoolean(initialState);
    const setIsOpenFalseCallback = useCallback(() => {
        setIsOpenFalse();
        if (onClose) {
            onClose();
        }
    }, [])



    const PopupWrapper = ({ children }: { children?: React.ReactNode }) => (
        <Popup onClose={setIsOpenFalseCallback} isOpen={isOpen}>{children}</Popup>
    );

    return [PopupWrapper, setIsOpenTrue, setIsOpenFalseCallback];
}
