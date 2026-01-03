import { useSyncExternalStore } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

type DeviceSnapshot = {
    type: DeviceType;
    width: number;
    ua: string;
};

let lastSnapshot: DeviceSnapshot | null = null;

const getSnapshot = (): DeviceSnapshot => {
    const width = window.innerWidth;
    const ua = navigator.userAgent;

    let type: DeviceType;
    if (width <= 480) {
        type = "mobile";
    } else if (width > 480 && width <= 1024) {
        type = "tablet";
    } else {
        type = "desktop";
    }

    const snapshot: DeviceSnapshot = { type, width, ua };

    if (
        lastSnapshot &&
        lastSnapshot.type === snapshot.type &&
        lastSnapshot.width === snapshot.width &&
        lastSnapshot.ua === snapshot.ua
    ) {
        return lastSnapshot;
    }

    lastSnapshot = snapshot;
    return snapshot;
};

const subscribe = (callback: () => void) => {
    let timeoutId: number | null = null;

    const handleResize = () => {
        if (timeoutId !== null) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(), 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
};

export function useDevice(): DeviceSnapshot {
    return useSyncExternalStore(subscribe, getSnapshot);
}
