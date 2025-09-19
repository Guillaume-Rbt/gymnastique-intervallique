export function clamp(min: number, number: number, max: number): number {
    return Math.max(min, Math.min(number, max))
}

export function randomNumber(min: number = 0, max: number = 1): number {
    if (min > max) {
        console.error("Min cannot be greater than Max")
        return -1
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}