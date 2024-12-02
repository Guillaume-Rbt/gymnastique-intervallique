import intervalsGenerator from "./randomIntervalGenerator";


export default class GameManager {
    constructor(options) {
        this.options = {
            allowedIntervals: null,
            ...options
        }
        this.intervalsGenerator = new intervalsGenerator();
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
