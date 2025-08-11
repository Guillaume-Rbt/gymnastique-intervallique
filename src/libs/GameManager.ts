import RandomIntervalGenerator, { Interval, type allowedIntervalsType } from "./RandomIntervalGenerator";
import Emitter from "./Emitter";
import { intervals } from "../utils/constants";
import IntervalPlayer from "./IntervalsPlayer";
import sound from "../assets/sounds/notes.wav";

type gameOptions = {
	allowedIntervals: allowedIntervalsType
};

export default class GameManager extends Emitter {
	options: gameOptions;
	intervals: Interval[] | [] = [];
	intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
	currentIntervalIndex: number = 0;
	intervalPlayer = new IntervalPlayer(sound);
	buttonsSelector: string = ".button-response";
	isStarted: boolean = false;
	numberOfIntervals: number = 10;
	#allowedIntervals: allowedIntervalsType = new Map();

	static get GAME_ENDED() {
		return "gameManager.game.ended";
	}

	static get GAME_STARTED() {
		return "gameManager.game.started";
	}

	static get READY() {
		return "gameManager.game.ready";
	}

	static get INTERVAL_STARTED() {
		return "gameManager.interval.started";
	}

	static get INTERVAL_ENDED() {
		return "gameManager.interval.ended";
	}

	static get REQUEST_NEXT_INTERVAL() {
		return "gameManager.request.next.interval";
	}

	get isLastInterval() {
		return this.currentIntervalIndex === this.intervals.length - 1;
	}

	set allowedIntervals(allowedIntervals: allowedIntervalsType) {
		this.#allowedIntervals = allowedIntervals;


		const currentInterval = this.getCurrentInterval();



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
			}
			else if (!checkIfIntervalIsAllowed(interval)) { this.intervals[i] = this.intervalsGenerator.generateInterval(); }

		}

		if (currentInterval && !checkIfIntervalIsAllowed(currentInterval)) {
			this.playCurrentInterval();
		}

	}
	/* 	set allowedIntervals(allowedIntervals: allowedIntervalsType) {
			this.options.allowedIntervals = allowedIntervals;
			this.intervalsGenerator.allowedIntervals = allowedIntervals;
			const generatedInterval = !this.isStarted ? this.intervalsGenerator.generateAnyIntervals(this.numberOfIntervals - (this.currentIntervalIndex)) : this.intervalsGenerator.generateAnyIntervals(this.numberOfIntervals - 1 - (this.currentIntervalIndex));
	
			let index = !this.isStarted ? this.currentIntervalIndex : this.currentIntervalIndex + 1;
	
			for (const interval of generatedInterval) {
				this.intervals[index] = interval;
				index++;
			}
			this.#allowedIntervals = allowedIntervals;
		} */


	get allowedIntervals() {
		return this.#allowedIntervals;
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
		this.addEventListeners();
	}

	startGame() {
		this.currentIntervalIndex = 0;
		this.isStarted = true;
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

		this.intervalPlayer.on(IntervalPlayer.READY, (data) => {
			this.emit(GameManager.READY, data);
		});
	}

	playCurrentInterval() {
		this.intervalPlayer.playInterval(this.getCurrentInterval());
	}

	nextInterval() {
		this.intervalPlayer.audio.pause();
		if (this.currentIntervalIndex < this.intervals.length - 1) {
			this.emit(GameManager.REQUEST_NEXT_INTERVAL, { instance: this });
			this.currentIntervalIndex++;
			return true;
		}

		this.emit(GameManager.GAME_ENDED, { instance: this });
		return false;
	}
}
