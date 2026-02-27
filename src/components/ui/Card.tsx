import { useRef } from "react";
import Scrollbar from "./Scrollbar";
import { createPortal } from "react-dom";
import useBoolean from "../../hooks/useBoolean";
import ButtonBack from "./ButtonBack";

export default function Card({
    children,
    className = [],
    title = "",
    openableFullscreen = true,
}: {
    children: React.ReactNode;
    className?: string[];
    title?: string;
    openableFullscreen?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    const fullsceenContainerRef = useRef<HTMLDivElement>(null);
    const fullscreenElementRef = useRef<HTMLDivElement>(null);

    const [isOpen, open, close] = useBoolean(false);

    return (
        <div
            className={`rounded-3 overflow-hidden border-solid flex flex-col border-theme-light  border-.2 ${className.join(" ")}`}>
            <div className='w-full bg-theme-light/10 p-block-2 flex align-items-center justify-between px-2'>
                <p className=' text-align-start'>{title}</p>
                {openableFullscreen && (
                    <p className='p-is-2 text-3 text-align-end cursor-pointer' onClick={open}>
                        Ouvrir en plein écran
                    </p>
                )}
            </div>

            <div
                ref={containerRef}
                className='flex w-full h-1 flex-grow position-relative overflow-hidden p-ie-3 mt-2 mb-2'>
                <Scrollbar containerRef={containerRef} elementRef={elementRef}></Scrollbar>
                <div ref={elementRef} className='flex position-relative flex-col gap-2 px-2 w-full'>
                    {children}
                </div>
            </div>
            {isOpen &&
                createPortal(
                    <div
                        className={`bg-[url(/images/background.webp)] color-theme-light bg-center z-50 bg-fixed bg-cover bg-no-repeat position-fixed w-full h-full`}>
                        <div className='w-full h-full p-4 bg-theme-blue/80 backdrop-blur-3xl flex flex-col'>
                            <ButtonBack onClick={close} />
                            <h1 className='text-8 text-center mb-6 mt-4'>{title}</h1>
                            <div
                                ref={fullsceenContainerRef}
                                className='h-1 overflow-hidden position-relative has-[.scrollbar]:p-ie-3 fullscreen-card flex flex-col flex-grow'>
                                <Scrollbar
                                    containerRef={fullsceenContainerRef}
                                    elementRef={fullscreenElementRef}></Scrollbar>
                                <div
                                    ref={fullscreenElementRef}
                                    className='position-relative slot has-[.graph-container]:h-full'>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.getElementById("card-fullscreen")!,
                )}
        </div>
    );
}
