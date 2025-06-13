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
  intervalPlayer = new IntervalPlayer("./assets/sounds/intervals.mp3");
  buttonsSelector: string = ".button-response";

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
    this.intervals = this.intervalsGenerator.generateAnyIntervals(10);
    this.currentIntervalIndex = 0;
  }

  getCurrentInterval() {
    return this.intervals[this.currentIntervalIndex];
  }

  checkResponse(intervalName: string | string[]): boolean {
    const currentInterval = this.getCurrentInterval();
    return Array.isArray(currentInterval.name) ? currentInterval.name.includes(intervalName) : currentInterval.name === intervalName;
  }

  nextInterval() {
    if (this.currentIntervalIndex < this.intervals.length - 1) {
      this.currentIntervalIndex++;
      return true;
    }
    return false;
  }

  handleClickResponse(event: MouseEvent) {

    const response = (event.target as HTMLElement).dataset.response;

    console.log(response)
  }

}