import { memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useBoolean } from "../hooks/useBoolean";
import { createScope, createTimeline, utils, type Scope } from "animejs";


export default function Popup({
    children,
    classes = null,
    onClose,
    displaySettingsRef
}: {
    displaySettingsRef: React.ForwardedRef<{
        openSettings: () => void;
    }> | null;
    children?: React.ReactNode;
    classes?: string | null | string[];
    onClose: () => void;
}): React.JSX.Element {

    const [isOpen, setIsOpenTrue, setIsOpenFalse] = useBoolean(false);

    const classesDefault = `${classes ?? ""}  opacity-0 overlay bg-op-90 bg-indigo-950 flex position-fixed top-0 left-0 w-full h-full flex-items-center flex-justify-center z-999 ${isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`;

    const root = useRef<HTMLDivElement | null>(null);
    const scope = useRef<Scope | null>(null);


    useEffect(() => {

        if (!root.current) return;

        utils.set(root.current, {
            opacity: 0,
            duration: 0,
            easing: "easeInOutQuad"
        })
        const firstChild = root.current.firstElementChild;


        if (firstChild) {
            utils.set(firstChild, {
                translateY: -40,
                opacity: 0,
                duration: 0,
                easing: "easeInOutQuad"
            })
        }
        scope.current = createScope({ root }).add(self => {
            self!.add("fadeIn", () => {

                const timeline = createTimeline({ autoplay: false })

                timeline.add(root.current!, {
                    opacity: { from: 0, to: 1 },
                    duration: 300,
                    easing: "easeInOutQuad"
                })

                if (firstChild) {
                    timeline.add(firstChild, {
                        translateY: { from: -40, to: 0 },
                        opacity: { from: 0, to: 1 },
                        duration: 300,
                        easing: "easeInOutQuad"
                    });
                }

                timeline.play()
            })

            self!.add("fadeOut", () => {

                const timeline = createTimeline({ autoplay: false })
                if (firstChild) {
                    timeline.add(firstChild, {
                        translateY: { from: 0, to: -40 },
                        opacity: { from: 1, to: 0 },
                        duration: 300,
                        easing: "easeInOutQuad"
                    });
                }
                timeline.add(root.current!, {
                    opacity: { from: 1, to: 0 },
                    duration: 300,
                    easing: "easeInOutQuad"
                })


                timeline.play()
            })
        })
    }, [])


    const onCloseCallback = useCallback(() => {
        onClose()
        setIsOpenFalse();
        scope.current!.methods.fadeOut()
    }, [])

    useImperativeHandle(displaySettingsRef, () => ({
        openSettings: () => {
            scope.current!.methods.fadeIn()
            setIsOpenTrue()
        }

    }))

    return (
        <div ref={root} onClick={onCloseCallback} className={classesDefault}>
            <div
                className="flex w-[65%] flex-col rounded-4 bg-slate-100 p-4"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}


export const PopupMemo = memo(Popup)