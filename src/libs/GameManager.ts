import RandomIntervalGenerator, { Interval } from "./RandomIntervalGenerator";
import Emitter from "./Emitter";
import { intervals } from "../utils/constants";
import IntervalPlayer from "./IntervalsPlayer";

type gameOptions = {
  allowedIntervals: Map<number, string | string[]>;
};

export default class GameManager extends Emitter {
  options: gameOptions;
  intervals: Interval[] | [];
  intervalsGenerator: RandomIntervalGenerator = new RandomIntervalGenerator();
  currentIntervalIndex: number = 0;
  allowedIntervals: Map<number, string | string[]>;
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




  get isLastInterval() {
    return this.currentIntervalIndex === this.intervals.length - 1;
  }

  constructor(options: Partial<gameOptions> = {}) {
    super();

    this.options = {
      allowedIntervals: new Map(intervals.map((interval, index) => [index, interval])),
      ...options,
    };

    this.allowedIntervals = this.options.allowedIntervals;
    this.intervals = [];
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

  nextInterval() {
    if (this.currentIntervalIndex < this.intervals.length - 1) {
      this.currentIntervalIndex++;
      return true;
    }

    this.emit(GameManager.GAME_ENDED, { instance: this });
    return false;
  }
}
