import type React from "react";
import { useBoolean } from "./useBoolean";

function Popup({
    children,
    isOpen,
}: {
    children?: React.ReactNode;
    isOpen: boolean;
}): React.JSX.Element {
    const classes = `overlay bg-op-90 bg-dark-100 flex position-fixed top-0 left-0 w-full h-full flex-items-center flex-justify-center z-50 ${isOpen ? "visible" : "invisible"}`;

    return <div className={classes}>{children}</div>;
}

export function usePopup(
    initialState: boolean = false
): [
        (props: { children?: React.ReactNode }) => React.JSX.Element,
        boolean,
        () => void,
        () => void
    ] {
    const [isOpen, setIsOpenTrue, setIsOpenFalse] = useBoolean(initialState);

    const PopupWrapper = ({ children }: { children?: React.ReactNode }) => (
        <Popup isOpen={isOpen}>{children}</Popup>
    );

    return [PopupWrapper, isOpen, setIsOpenTrue, setIsOpenFalse];
}
