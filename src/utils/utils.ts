const touchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

const events = {
    DOWN_START: touchDevice ? "touchstart" : ("mousedown" as keyof MouseEvent),
};

function ensureArrayOfStrings(value: string | string[]): string[] {
    if (Array.isArray(value)) return value;

    return value.split(" ");
}

function clamp(min: number, number: number, max: number): number {
    return Math.max(min, Math.min(number, max));
}

function randomNumber(min: number = 0, max: number = 1): number {
    if (min > max) {
        console.error("Min cannot be greater than Max");
        return -1;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function HTMLFromString(htmlString: string): DocumentFragment {
    const range = document.createRange();
    return range.createContextualFragment(htmlString);
}

function getEventCoords(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
        return { x: event.clientX, y: event.clientY };
    } else if (event instanceof TouchEvent) {
        const touch = event.changedTouches[0] || event.touches[0];

        return {
            x: touch.clientX,
            y: touch.clientY,
        };
    }
    return { x: 0, y: 0 };
}

function getRelativeEventCoords(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (!event.currentTarget) return { x: 0, y: 0 };
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const coords = getEventCoords(event);
    return {
        x: coords.x - rect.left,
        y: coords.y - rect.top,
    };
}

export default class Utils {
    static ensureArrayOfStrings = ensureArrayOfStrings;
    static clamp = clamp;
    static randomNumber = randomNumber;
    static HTMLFromString = HTMLFromString;
    static getEventCoords = getEventCoords;
    static getRelativeEventCoords = getRelativeEventCoords;
    static get EVENTS() {
        return events;
    }
}
