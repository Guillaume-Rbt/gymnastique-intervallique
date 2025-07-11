import { intervals, notes } from "../utils/constants";
import { randomNumber } from "../utils/numbers";

export type allowedIntervalsType = Map<number, { text: string | string[], enabled: boolean; }>;
type intervalGeneratorOptions = {
  allowedIntervals: allowedIntervalsType;
};

export default class RandomIntervalGenerator {
  options: intervalGeneratorOptions;
  intervalsKey: number[];
  private _allowedIntervals!: allowedIntervalsType;

  set allowedIntervals(value: allowedIntervalsType) {
    this._allowedIntervals = value;
  }

  get allowedIntervals(): allowedIntervalsType {
    return this._allowedIntervals;
  }

  constructor(options: Partial<intervalGeneratorOptions> = {}) {
    this.setDefaultOptions = this.setDefaultOptions.bind(this);
    this.generateInterval = this.generateInterval.bind(this);
    this.adjustIntervalOctave = this.adjustIntervalOctave.bind(this);

    this.options = this.setDefaultOptions(options);

    this.generateAnyIntervals = this.generateAnyIntervals.bind(this);

    this.allowedIntervals = this.options.allowedIntervals;
    this.intervalsKey = Array.from(this.allowedIntervals.keys());
  }

  setDefaultOptions(options: Partial<intervalGeneratorOptions>) {
    const mergeOptions = {
      allowedIntervals: new Map(
        intervals.map((interval, index) => {
          return [index, { text: interval, enabled: true }];
        }),
      ),
      ...options,
    };

    return mergeOptions;
  }

  generateInterval() {
    const index = randomNumber(0, this.intervalsKey.length - 1);
    const length = this.intervalsKey[index];
    const name = this.allowedIntervals.get(length)!.text as string;

    return new Interval({ length, name });
  }

  adjustIntervalOctave(interval: Interval) {
    switch (interval.direction) {
      case "asc":
        if (interval.endNote.octave > 2) {
          interval.startNote.octave = interval.startNote.octave - 1;
          interval.endNote.octave = interval.endNote.octave - 1;
        }
        break;
      case "desc":
        if (interval.endNote.octave < 0) {
          interval.startNote.octave = interval.startNote.octave + 1;
          interval.endNote.octave = interval.endNote.octave + 1;
        }
        break;
    }
    return interval;
  }

  generateAnyIntervals(nbIntervals: number = 10) {
    console.log("Generating", nbIntervals, "intervals");
    let intervals = [];
    for (let i = 0; i < nbIntervals; i++) {
      intervals.push(this.generateInterval());
    }
    return intervals;
  }
}

class Note {
  name: string | string[];
  octave: number;
  index: number;

  constructor(index: number, octave: number | null = null) {
    this.index = index;
    this.name = notes[index];
    this.octave = octave !== null ? octave : randomNumber(0, 2);
  }
}

export class Interval {
  length: number;
  direction: string;
  name: string;
  isPassOctave: boolean = false;
  startNote: Note;
  endNote: Note;

  #notes: { startNote: Note; endNote: Note };

  constructor(data: { length: number; name: string }) {
    this.length = data.length;
    this.name = data.name;
    this.direction = randomNumber(0, 1) == 0 ? "desc" : "asc";
    this.#notes = this.setNotes();

    this.startNote = this.#notes.startNote;
    this.endNote = this.#notes.endNote;

    this.adjustlOctave = this.adjustlOctave.bind(this);


  }

  adjustlOctave({ startNote, endNote }: { startNote: Note; endNote: Note }) {
    switch (this.direction) {
      case "asc":
        if (endNote.octave > 2) {
          startNote.octave = startNote.octave - 1;
          endNote.octave = endNote.octave - 1;
        }
        break;
      case "desc":
        if (endNote.octave < 0) {
          startNote.octave = startNote.octave + 1;
          endNote.octave = endNote.octave + 1;
        }
        break;
    }

    return { startNote: startNote, endNote: endNote };
  }

  setNotes() {
    const startNote = new Note(randomNumber(0, 11));

    this.isPassOctave =
      this.direction == "asc" ? (startNote.index + this.length > 11 ? true : false) : startNote.index - this.length < 0 ? true : false;

    const endNoteIndex =
      this.direction == "asc"
        ? startNote.index + this.length > 11
          ? startNote.index + this.length - 12
          : startNote.index + this.length
        : startNote.index - this.length < 0
          ? 12 + (startNote.index - this.length)
          : startNote.index - this.length;

    const endNote = new Note(
      endNoteIndex,
      this.isPassOctave ? (this.direction == "asc" ? startNote.octave + 1 : startNote.octave - 1) : startNote.octave,
    );
    return this.adjustlOctave({ startNote, endNote });
  }
}
