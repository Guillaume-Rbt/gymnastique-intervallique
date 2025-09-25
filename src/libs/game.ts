import Emitter from "./emitter-mixin";
import { Interval } from "./interval-generator";
import RandomIntervalGenerator from "./interval-generator";
import { intervals } from "../utils/constants";

export enum GAME_STATES {
    INIT = "init",
    READY = "ready",
    STARTED = "started",
    WAIT_ANSWER = "wait",
    ANSWERED = "answered",
    INTERVAL_PLAYED = "interval.played",
    ENDED = "ended",
}

type gameConfig = { allowedIntervals: Map<number, { text: string; enabled: boolean }> };

export default class Game extends Emitter {
    config: gameConfig = { allowedIntervals: new Map() };
    intervals: Interval[] = [];
    allowedIntervals: Map<number, { text: string; enabled: boolean }> = new Map();
    intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
    currentIntervalIndex: number = 0;
    #state: GAME_STATES = GAME_STATES.INIT;

    static get STATES() {
        return GAME_STATES;
    }

    get state() {
        return this.#state;
    }

    set state(value: GAME_STATES) {
        this.#state = value;
        this.emit(Game.EVENTS.STATE_CHANGED, { state: this.#state });
    }

    static EVENTS = {
        STATE_CHANGED: "game.state.changed",
        PROGRESS_CHANGED: "game.progress.changed",
    };

    constructor(options: Partial<gameConfig> = {}) {
        super();

        this.config = {
            allowedIntervals: new Map(
                intervals.map((interval, index) => {
                    return [index, { text: interval, enabled: true }];
                }),
            ),
            ...options,
        };

        this.allowedIntervals = this.config.allowedIntervals;
    }

    startGame() {
        this.currentIntervalIndex = 0;
        this.state = GAME_STATES.STARTED;
    }

    getCurrentInterval() {
        return this.intervals[this.currentIntervalIndex];
    }

    nextInterval() {
        if (this.currentIntervalIndex < this.intervals.length - 1) {
            this.currentIntervalIndex++;
            this.emit(Game.EVENTS.PROGRESS_CHANGED, {
                current: this.currentIntervalIndex,
                total: this.intervals.length,
            });
            return true;
        }
        return false;
    }

    checkAnswer(answer: string) {
        const currentInterval = this.getCurrentInterval();
        if (!currentInterval) return false;
        return currentInterval.name === answer;
    }
}
