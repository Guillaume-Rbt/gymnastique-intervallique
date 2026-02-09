import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Utils from "../../utils/utils";

export function Scrollbar({
    containerRef,
    elementRef,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    elementRef: React.RefObject<HTMLDivElement | null>;
}) {
    const ro = useRef<ResizeObserver | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollHeight, setScrollHeight] = useState(0);
    const [clientHeight, setClientHeight] = useState(0);

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        const startY = Utils.getEventCoords(event.nativeEvent).y;
        const startScrollTop = scrollTop;

        const onMouseMove = (moveEvent: Event) => {
            if (containerRef.current && elementRef.current) {
                const deltaY = Utils.getEventCoords(moveEvent as MouseEvent | TouchEvent).y - startY;
                const trackHeight = containerRef.current.clientHeight;
                const thumbHeight = Math.max((containerRef.current.clientHeight / scrollHeight) * trackHeight, 20);
                const scrollableHeight = scrollHeight - clientHeight;
                const scrollRatio = scrollableHeight / (trackHeight - thumbHeight);

                const newScrollTop = Utils.clamp(0, startScrollTop + deltaY * scrollRatio, scrollableHeight);

                elementRef.current.style.top = `-${newScrollTop}px`;
                setScrollTop(newScrollTop);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onWheel = useCallback(
        (event: Event) => {
            const wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            if (containerRef.current && elementRef.current) {
                const delta = wheelEvent.deltaY;
                const scrollableHeight = scrollHeight - clientHeight;
                const newScrollTop = Utils.clamp(0, scrollTop + delta, scrollableHeight);

                elementRef.current.style.top = `-${newScrollTop}px`;
                setScrollTop(newScrollTop);
            }
        },
        [scrollTop, scrollHeight, clientHeight],
    );

    const updateScrollData = () => {
        if (containerRef.current && elementRef.current) {
            const currentTop = parseFloat(elementRef.current.style.top) || 0;
            setScrollTop(Math.abs(currentTop));
            setScrollHeight(elementRef.current.scrollHeight);
            setClientHeight(containerRef.current.clientHeight);
        }
    };

    const onContainerDown = useCallback(
        (event: Event) => {
            const touchEvent = event as MouseEvent | TouchEvent;
            const startY = Utils.getEventCoords(touchEvent).y;
            const startScrollTop = scrollTop;

            const onMove = (moveEvent: Event) => {
                const moveCoords = Utils.getEventCoords(moveEvent as MouseEvent | TouchEvent);
                if (containerRef.current && elementRef.current) {
                    const deltaY = startY - moveCoords.y; // Inversé pour un scroll naturel
                    const scrollableHeight = scrollHeight - clientHeight;
                    const newScrollTop = Utils.clamp(0, startScrollTop + deltaY, scrollableHeight);

                    elementRef.current.style.top = `-${newScrollTop}px`;
                    setScrollTop(newScrollTop);
                }
            };

            const onEnd = () => {
                document.removeEventListener(Utils.EVENTS.MOVE as string, onMove);
                document.removeEventListener(Utils.EVENTS.UP_END as string, onEnd);
            };

            document.addEventListener(Utils.EVENTS.MOVE as string, onMove);
            document.addEventListener(Utils.EVENTS.UP_END as string, onEnd);
        },
        [scrollTop, scrollHeight, clientHeight],
    );

    const handleResize = useCallback(() => {
        updateScrollData();
    }, []);

    // Forcer une mise à jour après chaque rendu pour détecter les changements de contenu
    useLayoutEffect(() => {
        updateScrollData();
    });

    useEffect(() => {
        const container = containerRef.current;
        const element = elementRef.current;

        if (!container || !element) return;

        ro.current = new ResizeObserver(handleResize);
        ro.current.observe(element);

        const touchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

        if (touchDevice) {
            container.addEventListener(Utils.EVENTS.DOWN_START as string, onContainerDown);
        } else {
            container.addEventListener("wheel", onWheel, { passive: false });
        }

        updateScrollData();

        return () => {
            if (ro.current) {
                ro.current.disconnect();
            }
            container.removeEventListener("wheel", onWheel);
            container.removeEventListener(Utils.EVENTS.DOWN_START as string, onContainerDown);
        };
    }, [onWheel, onContainerDown, handleResize]);

    // Don't display scrollbar if all content is visible

    console.log("scrollHeight:", scrollHeight, "clientHeight:", clientHeight);
    if (scrollHeight <= clientHeight) {
        return null;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = Utils.clamp(0, (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop, maxThumbTop);

    return (
        <div className='bg-theme-light/20 w-1.5 max-sm:w-1 rounded-full position-absolute top-0 right-2 h-full hover:bg-theme-light/40'>
            <div
                onMouseDown={onMouseDown}
                className='w-1.5 max-sm:w-1 rounded-full bg-theme-light position-absolute cursor-pointer hover:bg-theme-light/80'
                style={{
                    height: `${thumbHeight}px`,
                    top: `${thumbTop}px`,
                }}></div>
        </div>
    );
}
