import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Utils from "../../utils/utils";

type ScrollState = {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
    paddingTop: number;
};

const INITIAL_STATE: ScrollState = { scrollTop: 0, scrollHeight: 0, clientHeight: 0, paddingTop: 0 };

export default function Scrollbar({
    containerRef,
    elementRef,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    elementRef: React.RefObject<HTMLDivElement | null>;
}) {
    const ro = useRef<ResizeObserver | null>(null);
    const mo = useRef<MutationObserver | null>(null);
    const rafRef = useRef<number | null>(null);
    const [state, setState] = useState<ScrollState>(INITIAL_STATE);
    const { scrollTop, scrollHeight, clientHeight, paddingTop } = state;

    const updateScrollData = useCallback(() => {
        if (!containerRef.current || !elementRef.current) return;

        const cs = window.getComputedStyle(containerRef.current);
        const pt = parseFloat(cs.paddingTop) || 0;
        const pb = parseFloat(cs.paddingBottom) || 0;
        const viewportHeight = Math.max(containerRef.current.clientHeight - pt - pb, 0);
        const currentScrollHeight = elementRef.current.scrollHeight;
        const currentTop = Math.abs(parseFloat(elementRef.current.style.top) || 0);
        const scrollableHeight = Math.max(currentScrollHeight - viewportHeight, 0);
        const clampedScrollTop = Utils.clamp(0, currentTop, scrollableHeight);

        if (clampedScrollTop !== currentTop) {
            elementRef.current.style.top = `-${clampedScrollTop}px`;
        }

        setState({
            scrollTop: clampedScrollTop,
            scrollHeight: currentScrollHeight,
            clientHeight: viewportHeight,
            paddingTop: pt,
        });
    }, [containerRef, elementRef]);

    const handleResize = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            updateScrollData();
            rafRef.current = null;
        });
    }, [updateScrollData]);

    useLayoutEffect(() => {
        updateScrollData();
    }, [updateScrollData]);

    const onWheel = useCallback(
        (event: Event) => {
            const wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            if (!containerRef.current || !elementRef.current) return;
            const newScrollTop = Utils.clamp(0, scrollTop + wheelEvent.deltaY, scrollHeight - clientHeight);
            elementRef.current.style.top = `-${newScrollTop}px`;
            setState((s) => ({ ...s, scrollTop: newScrollTop }));
        },
        [scrollTop, scrollHeight, clientHeight, containerRef, elementRef],
    );

    const onContainerDown = useCallback(
        (event: Event) => {
            const startY = Utils.getEventCoords(event as MouseEvent | TouchEvent).y;
            const startScrollTop = scrollTop;
            const scrollableHeight = scrollHeight - clientHeight;

            const onMove = (moveEvent: Event) => {
                if (!elementRef.current) return;
                const deltaY = startY - Utils.getEventCoords(moveEvent as MouseEvent | TouchEvent).y;
                const newScrollTop = Utils.clamp(0, startScrollTop + deltaY, scrollableHeight);
                elementRef.current.style.top = `-${newScrollTop}px`;
                setState((s) => ({ ...s, scrollTop: newScrollTop }));
            };

            const onEnd = () => {
                document.removeEventListener(Utils.EVENTS.MOVE as string, onMove);
                document.removeEventListener(Utils.EVENTS.UP_END as string, onEnd);
            };

            document.addEventListener(Utils.EVENTS.MOVE as string, onMove);
            document.addEventListener(Utils.EVENTS.UP_END as string, onEnd);
        },
        [scrollTop, scrollHeight, clientHeight, elementRef],
    );

    const onMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            const startY = Utils.getEventCoords(event.nativeEvent).y;
            const startScrollTop = scrollTop;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
            const scrollableHeight = scrollHeight - clientHeight;
            const scrollRatio = scrollableHeight / (clientHeight - thumbHeight);

            const onMouseMove = (moveEvent: Event) => {
                if (!elementRef.current) return;
                const deltaY = Utils.getEventCoords(moveEvent as MouseEvent | TouchEvent).y - startY;
                const newScrollTop = Utils.clamp(0, startScrollTop + deltaY * scrollRatio, scrollableHeight);
                elementRef.current.style.top = `-${newScrollTop}px`;
                setState((s) => ({ ...s, scrollTop: newScrollTop }));
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        },
        [scrollTop, clientHeight, scrollHeight, elementRef],
    );

    useEffect(() => {
        const container = containerRef.current;
        const element = elementRef.current;
        if (!container || !element) return;

        ro.current = new ResizeObserver(handleResize);
        ro.current.observe(element);
        ro.current.observe(container);

        // attributes exclu : chaque écriture de style.top déclencherait une boucle de mise à jour
        mo.current = new MutationObserver(handleResize);
        mo.current.observe(element, { childList: true, subtree: true, characterData: true });

        const touchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (touchDevice) {
            container.addEventListener(Utils.EVENTS.DOWN_START as string, onContainerDown);
        } else {
            container.addEventListener("wheel", onWheel, { passive: false });
        }

        handleResize();
        document.fonts?.ready.then(() => handleResize());

        return () => {
            ro.current?.disconnect();
            mo.current?.disconnect();
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            container.removeEventListener("wheel", onWheel);
            container.removeEventListener(Utils.EVENTS.DOWN_START as string, onContainerDown);
        };
    }, [onWheel, onContainerDown, handleResize]);

    if (scrollHeight <= clientHeight) return null;

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = Utils.clamp(0, (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop, maxThumbTop);

    return (
        <div
            className='scrollbar bg-theme-light/20 w-1.5 max-sm:w-1 rounded-full position-absolute right-2 hover:bg-theme-light/40'
            style={{ top: `${paddingTop}px`, height: `${clientHeight}px` }}>
            <div
                onMouseDown={onMouseDown}
                className='w-1.5 max-sm:w-1 rounded-full bg-theme-light position-absolute cursor-pointer hover:bg-theme-light/80'
                style={{ height: `${thumbHeight}px`, top: `${thumbTop}px` }}
            />
        </div>
    );
}
