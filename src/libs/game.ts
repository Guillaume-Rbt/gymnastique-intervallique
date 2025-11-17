import Emitter from "./emitter-mixin";
import { Interval } from "./interval-generator";
import RandomIntervalGenerator from "./interval-generator";
import { intervals } from "../utils/constants";
import Sequencer from "./sequencer";

export enum GAME_STATES {
    INIT = "init",
    READY = "ready",
    STARTED = "started",
    NEW_INTERVAL_PLAYING = "new.interval.playing",
    WAIT_ANSWER = "wait",
    ANSWERED = "answered",
    ENDED = "ended",
}

type GameConfig = { allowedIntervals: Map<number, { text: string; enabled: boolean }> };

export default class Game extends Emitter {
    config: GameConfig = { allowedIntervals: new Map() };
    intervals: Interval[] = [];
    #allowedIntervals: Map<number, { text: string; enabled: boolean }> = new Map();
    intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
    currentIntervalIndex: number = 0;
    listenersPerState: Map<GAME_STATES, Function[]> = new Map();
    numberOfIntervals: number = 10;
    sequencer: Sequencer = new Sequencer();
    answeredIntervals: Set<{ id: string; answer: string; correct: boolean; expected: string; interval: Interval }> =
        new Set();
    #score: number = 0;
    #questionScore: number = 5;
    #state: GAME_STATES = GAME_STATES.INIT;
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
    }

    set score(value: number) {
        this.#score = value;
        this.emit(Game.EVENTS.SCORE_CHANGED, { score: this.#score });
    }

    get score() {
        return this.#score;
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
        ANSWERED: "game.answered",
        INTERVAL_PLAYING: "game.interval.playing",
        INTERVAL_ENDED: "game.interval.ended",
        SCORE_CHANGED: "game.score.changed",
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
        this.playCurrentInterval = this.playCurrentInterval.bind(this);

        Game.instance = this;
        this.addListeners();
    }

    start() {
        this.currentIntervalIndex = 0;
        this.updateState(GAME_STATES.STARTED);
    }

    getCurrentInterval() {
        return this.intervals[this.currentIntervalIndex];
    }

    playCurrentInterval() {
        const currentInterval = this.getCurrentInterval();

        this.sequencer.createSequenceFromInterval(currentInterval!);

        this.sequencer.playSequence();
    }

    playInterval(interval: Interval) {
        this.sequencer.createSequenceFromInterval(interval);
        this.sequencer.playSequence();
    }

    nextInterval() {
        const currentInterval = this.getCurrentInterval();

        if (this.state !== Game.STATES.WAIT_ANSWER) {
            this.answeredIntervals.add({
                id: currentInterval.id,
                correct: false,
                answer: "Non répondu",
                expected: currentInterval.name,
                interval: currentInterval,
            });
        }

        if (this.currentIntervalIndex < this.intervals.length - 1) {
            this.currentIntervalIndex++;
            this.emit(Game.EVENTS.PROGRESS_CHANGED, {
                current: this.currentIntervalIndex,
                total: this.intervals.length,
            });
            this.playCurrentInterval();
            this.updateState(GAME_STATES.NEW_INTERVAL_PLAYING);
            this.sequencer.once(Sequencer.EVENTS.SEQUENCE_END, () => {
                this.updateState(GAME_STATES.WAIT_ANSWER);
            });

            return true;
        }

        this.updateState(GAME_STATES.ENDED);
        this.sequencer.clear();
        return false;
    }

    updateState(state: GAME_STATES, data: { [key: string]: any } = {}) {
        this.state = state;
        this.emit(Game.EVENTS.STATE_CHANGED, { state: this.#state, ...data });
    }

    async init() {
        await this.sequencer.loadAudioSprite();

        this.updateState(GAME_STATES.READY);
    }

    checkAnswer(answer: string) {
        const currentInterval = this.getCurrentInterval();
        if (!currentInterval) return false;

        this.updateState(GAME_STATES.ANSWERED, {
            answer: answer,
            expected: currentInterval.name,
            correct: currentInterval.name === answer,
        });

        const isValid = currentInterval.name === answer;

        if (isValid) {
            this.score += this.questionScore;
        }

        this.answeredIntervals.add({
            id: this.getCurrentInterval().id,
            correct: isValid,
            answer: answer,
            expected: currentInterval.name,
            interval: this.getCurrentInterval(),
        });

        return isValid;
    }

    handleIntervalEnd() {
        this.emit(Game.EVENTS.INTERVAL_ENDED);
    }

    handleIntervalStart() {
        this.emit(Game.EVENTS.INTERVAL_PLAYING);
    }

    isAtLeast(state: GAME_STATES) {
        const states = Object.values(GAME_STATES);

        return states.indexOf(this.state) >= states.indexOf(state);
    }

    addListeners() {
        this.sequencer.on(Sequencer.EVENTS.SEQUENCE_START, this.handleIntervalStart.bind(this));

        this.sequencer.on(Sequencer.EVENTS.SEQUENCE_END, this.handleIntervalEnd.bind(this));

        this.sequencer.on(Sequencer.EVENTS.SEQUENCE_ABORT, this.handleIntervalEnd.bind(this));

        this.sequencer.once(Sequencer.EVENTS.SEQUENCE_END, () => {
            this.updateState(GAME_STATES.WAIT_ANSWER);
        });
    }

    removeListeners() {
        this.sequencer.off(Sequencer.EVENTS.SEQUENCE_START, this.handleIntervalStart);
        this.sequencer.off(Sequencer.EVENTS.SEQUENCE_END, this.handleIntervalEnd);
        this.sequencer.off(Sequencer.EVENTS.SEQUENCE_ABORT, this.handleIntervalEnd.bind(this));
    }

    destroy() {
        this.removeListeners();
        Game.instance = null;
    }
}
