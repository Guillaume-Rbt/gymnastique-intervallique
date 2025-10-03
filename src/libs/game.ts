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

type GameConfig = { allowedIntervals: Map<number, { text: string; enabled: boolean }> };

export default class Game extends Emitter {
    config: GameConfig = { allowedIntervals: new Map() };
    intervals: Interval[] = [];
    #allowedIntervals: Map<number, { text: string; enabled: boolean }> = new Map();
    intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
    currentIntervalIndex: number = 0;
    #state: GAME_STATES = GAME_STATES.INIT;
    listenersPerState: Map<GAME_STATES, Function[]> = new Map();
    numberOfIntervals: number = 10;
    score: number = 0;
    #questionScore: number = 5;
    static instance: null | Game = null;

    static get STATES() {
        return GAME_STATES;
    }

    get questionScore() {
        return this.#questionScore;
    }

    set questionScore(value: number) {
        this.#questionScore = value;
    }

    get state() {
        return this.#state;
    }

    set state(value: GAME_STATES) {
        this.#state = value;
        this.emit(Game.EVENTS.STATE_CHANGED, { state: this.#state });
    }

    set allowedIntervals(allowedIntervals: Map<number, { text: string; enabled: boolean }>) {
        this.#allowedIntervals = allowedIntervals;

        this.intervalsGenerator.allowedIntervals = allowedIntervals;

        function checkIfIntervalIsAllowed(interval: Interval) {
            for (const [_, value] of allowedIntervals) {
                if (value.enabled && value.text === interval.name) {
                    return true;
                }
            }
            return false;
        }

        for (let i = this.currentIntervalIndex; i < this.numberOfIntervals; i++) {
            const interval = this.intervals[i];
            if (!interval) {
                this.intervals[i] = this.intervalsGenerator.generateInterval();
            } else if (!checkIfIntervalIsAllowed(interval)) {
                this.intervals[i] = this.intervalsGenerator.generateInterval();
            }
        }
    }

    get allowedIntervals() {
        return this.#allowedIntervals;
    }

    static EVENTS = {
        STATE_CHANGED: "game.state.changed",
        PROGRESS_CHANGED: "game.progress.changed",
        ALLOWED_INTERVALS_CHANGED: "game.allowedIntervals.changed",
    };

    constructor(options: Partial<GameConfig> = {}) {
        if (Game.instance) {
            return Game.instance;
        }
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

        Game.instance = this;
    }

    start() {
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

        this.state = GAME_STATES.ANSWERED;

        const isValid = currentInterval.name === answer;

        if (isValid) {
            this.score += this.questionScore;
        }

        return isValid;
    }
}
