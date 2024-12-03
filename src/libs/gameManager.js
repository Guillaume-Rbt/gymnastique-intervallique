import intervalsGenerator from "./RandomIntervalGenerator";


export default class GameManager {

    #allowedIntervals = null

    set allowedIntervals(value) {
        const intervals = this.intervalsGenerator.generateAnyIntervals(10 - this.currentIntervalIndex - 1)
        for (let i = 0; i < intervals.length; i++) {
            this.intervals[this.currentIntervalIndex + i + 1] = intervals[i]
        }
        this.#allowedIntervals = value
    }

    constructor(options) {
        this.options = {
            allowedIntervals: null,
            ...options
        }

        this.#allowedIntervals = this.options.allowedIntervals
        this.intervalsGenerator = new intervalsGenerator({ allowedIntervals: this.options.allowedIntervals });
        this.intervals = [];
        this.currentIntervalIndex = 0;
    }

    startGame() {
        this.intervals = this.intervalsGenerator.generateAnyIntervals(10);
        this.currentIntervalIndex = 0;
    }

    getCurrentInterval() {
        return this.intervals[this.currentIntervalIndex];
    }

    verifyAnswer(userAnswer) {
        const currentInterval = this.getCurrentInterval().name

        return Array.isArray(currentInterval.name)
            ? currentInterval.name.includes(userAnswer)
            : currentInterval.name === userAnswer;;
    }

    nextInterval() {
        if (this.currentIntervalIndex < this.intervals.length - 1) {
            this.currentIntervalIndex++;
            return true;
        }
        return false;
    }
}
