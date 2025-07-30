import Emitter from "./Emitter";
import type { Interval } from "./RandomIntervalGenerator";

export default class IntervalPlayer extends Emitter {
	audio: HTMLAudioElement = new Audio();
	interval!: Interval;
	intervalTimePerNote = { timeNote1: 0, timeNote2: 1 };
	currentNote: number = 1;
	timeSeparateNotes: number = 2000;
	emitEndedOncePerInterval: boolean = true;
	firstPlay: boolean = true;
	private static _instance: IntervalPlayer | null = null;

	static get INTERVAL_ENDED() {
		return "intervalPlayer.sound.end";
	}
	static get INTERVAL_STARTED() {
		return "intervalPlayer.sound.start";
	}

	static get READY() {
		return "intervalPlayer.ready";
	}

	constructor(source: string, timeSeparateNotes?: number) {
		if (IntervalPlayer._instance) {
			return IntervalPlayer._instance;
		}
		super();
		IntervalPlayer._instance = this;
		this.audio = new Audio(source);
		this.intervalTimePerNote = {
			timeNote1: 0,
			timeNote2: 1,
		};
		this.currentNote = 1;
		this.timeSeparateNotes = timeSeparateNotes || 2000;
		this.setIntervalTimes = this.setIntervalTimes.bind(this);
		this.onAudioTimeUpdate = this.onAudioTimeUpdate.bind(this);
		this.playInterval = this.playInterval.bind(this);
		this.ready = this.ready.bind(this);

		this.removeListener = this.removeListener.bind(this);

		this.init();
	}

	setIntervalTimes() {
		this.audio.pause();
		this.audio.currentTime = this.intervalTimePerNote.timeNote1 / 1000;
	}

	onAudioTimeUpdate() {
		if (this.audio.currentTime >= this.intervalTimePerNote.timeNote1 / 1000 + 0.85 && this.currentNote == 1) {

			this.audio.pause();
			this.audio.currentTime = this.intervalTimePerNote.timeNote2 / 1000;
			this.currentNote = 2;
			this.audio.play();
		} else if (this.currentNote == 2 && this.audio.currentTime >= this.intervalTimePerNote.timeNote2 / 1000 + 0.85) {

			this.audio.pause();

			this.emit(IntervalPlayer.INTERVAL_ENDED, { interval: this.interval, firstPlay: this.firstPlay });
			this.firstPlay = false;
		}
	}

	playInterval(interval: Interval) {
		if (this.interval !== interval) {
			this.interval = interval;
			this.firstPlay = true;
			this.findTimeNotes();
			this.setIntervalTimes();
		}
		if (this.audio.paused) {
			this.currentNote = 1;
			this.audio.currentTime = this.intervalTimePerNote.timeNote1 / 1000;
			this.audio.play();
			this.emit(IntervalPlayer.INTERVAL_STARTED, { interval: this.interval, firstPlay: this.firstPlay });
		}
	}

	ready() {
		this.audio.removeEventListener("canplay", this.ready);
		this.audio.addEventListener("timeupdate", this.onAudioTimeUpdate);
		this.emit(IntervalPlayer.READY, { interval: this.interval });
	}

	init() {
		this.audio.addEventListener("canplay", this.ready);
	}

	isPlaying() {
		return !this.audio.paused;
	}

	findTimeNotes() {
		const { startNote, endNote } = this.interval;

		const timeNoteStart = this.timeSeparateNotes * (startNote.index + startNote.octave * 12);
		const timeNoteEnd = this.timeSeparateNotes * (endNote.index + endNote.octave * 12);

		this.intervalTimePerNote = {
			timeNote1: timeNoteStart,
			timeNote2: timeNoteEnd,
		};
	}
}