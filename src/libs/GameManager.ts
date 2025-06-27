import RandomIntervalGenerator, { Interval, type allowedIntervalsType } from "./RandomIntervalGenerator";
import Emitter from "./Emitter";
import { intervals } from "../utils/constants";
import IntervalPlayer from "./IntervalsPlayer";

type gameOptions = {
	allowedIntervals: allowedIntervalsType
};

export default class GameManager extends Emitter {
	options: gameOptions;
	intervals: Interval[] | [];
	intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
	currentIntervalIndex: number = 0;
	allowedIntervals: allowedIntervalsType;
	intervalPlayer = new IntervalPlayer("./src/assets/sounds/notes.wav");
	buttonsSelector: string = ".button-response";
	hasStarted: boolean = false;
	numberOfIntervals: number = 10;

	static get GAME_ENDED() {
		return "gameManager.game.ended";
	}

	static get GAME_STARTED() {
		return "gameManager.game.started";
	}

	static get INTERVAL_STARTED() {
		return "gameManager.interval.started";
	}

	static get INTERVAL_ENDED() {
		return "gameManager.interval.ended";
	}

	get isLastInterval() {
		return this.currentIntervalIndex === this.intervals.length - 1;
	}

	constructor(options: Partial<gameOptions> = {}) {
		super();

		this.options = {
			allowedIntervals: new Map(
				intervals.map((interval, index) => {
					return [index, { text: interval, enabled: true }];
				})),
			...options,
		};

		this.allowedIntervals = this.options.allowedIntervals;
		this.intervals = [];
		this.addEventListeners();
	}

	startGame() {
		if (this.hasStarted) {
			this.emit(GameManager.GAME_STARTED, { instance: this });
			console.warn("🚫 game is already started");
			return;
		}
		this.intervals = this.intervalsGenerator.generateAnyIntervals(this.numberOfIntervals);
		this.currentIntervalIndex = 0;
		this.hasStarted = true;

		this.emit(GameManager.GAME_STARTED, { instance: this });
	}

	getCurrentInterval() {
		return this.intervals[this.currentIntervalIndex];
	}

	getProgress() {
		return {
			current: this.currentIntervalIndex + 1,
			total: this.intervals.length,
		};
	}

	addEventListeners() {
		this.intervalPlayer.on(IntervalPlayer.INTERVAL_STARTED, (data) => {
			this.emit(GameManager.INTERVAL_STARTED, data);
		});

		this.intervalPlayer.on(IntervalPlayer.INTERVAL_ENDED, (data) => {
			this.emit(GameManager.INTERVAL_ENDED, data);
		});
	}

	playCurrentInterval() {
		this.intervalPlayer.playInterval(this.getCurrentInterval());
	}

	nextInterval() {
		this.intervalPlayer.audio.pause();
		if (this.currentIntervalIndex < this.intervals.length - 1) {
			this.currentIntervalIndex++;
			return true;
		}

		this.emit(GameManager.GAME_ENDED, { instance: this });
		return false;
	}
}
