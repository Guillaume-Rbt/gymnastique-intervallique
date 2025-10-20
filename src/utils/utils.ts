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

export default class Utils {
    static ensureArrayOfStrings = ensureArrayOfStrings;
    static clamp = clamp;
    static randomNumber = randomNumber;
    static HTMLFromString = HTMLFromString;
    static get EVENTS() {
        return events;
    }
}
