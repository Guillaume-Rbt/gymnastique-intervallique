import useBoolean from "../../hooks/useBoolean";
import Button from "../ui/Button";
import SettingsIcon from "../../assets/images/settings.svg?react";
import { createPortal } from "react-dom";
import Toogle from "../ui/Toggle";

export default function Settings() {
    const [opened, show, hide] = useBoolean(false);

    const classes = opened ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0";

    return (
        <>
            <Button
                onClick={show}
                classes={
                    "text-5.5 color-slate-100 px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-slate-100/40 bg-slate-100/5 rounded-2 hover:bg-white/20"
                }>
                <SettingsIcon />
            </Button>
            {createPortal(
                <div
                    className={` bg-[url(./images/background.webp)] bg-center bg-fixed bg-cover bg-no-repeat position-fixed transition-opacity  duration-200 top-0 left-0 w-full h-full z-20 ${classes}`}>
                    <div className='w-full h-full bg-theme-blue/80 backdrop-blur-3xl p-4'>
                        <Toogle label='Example Toggle' />
                    </div>
                </div>,
                document.querySelector("#root")!,
            )}
        </>
    );
}
