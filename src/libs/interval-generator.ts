import { intervals, notes } from "../utils/constants";
import Utils from "../utils/utils";
import UUID from "./uuid";

export type AllowedIntervals = Map<number, { text: string | string[]; enabled: boolean }>;
type intervalGeneratorOptions = {
    allowedIntervals: AllowedIntervals;
};

export default class RandomIntervalGenerator {
    id: string = UUID.generate();
    options: intervalGeneratorOptions;
    intervalsKey: number[] = [];
    #allowedIntervals!: AllowedIntervals;

    set allowedIntervals(value: AllowedIntervals) {
        this.#allowedIntervals = value;
        this.intervalsKey = Array.from(this.allowedIntervals.keys()).filter((key) => {
            if (this.allowedIntervals.get(key)!.enabled) {
                return this.allowedIntervals.get(key)?.enabled;
            }
        });
    }

    get allowedIntervals(): AllowedIntervals {
        return this.#allowedIntervals;
    }

    constructor(options: Partial<intervalGeneratorOptions> = {}) {
        this.setDefaultOptions = this.setDefaultOptions.bind(this);
        this.generateInterval = this.generateInterval.bind(this);

        this.options = this.setDefaultOptions(options);

        this.generateAnyIntervals = this.generateAnyIntervals.bind(this);

        this.allowedIntervals = this.options.allowedIntervals;
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
        const index = Utils.randomNumber(0, this.intervalsKey.length - 1);
        const length = this.intervalsKey[index];
        const name = this.allowedIntervals.get(length)!.text as string;

        return new Interval({ length, name });
    }

    generateAnyIntervals(nbIntervals: number = 10) {
        let intervals = [];
        for (let i = 0; i < nbIntervals; i++) {
            intervals.push(this.generateInterval());
        }
        return intervals;
    }
}
class Note {
    id: string = UUID.generate();
    name: string | string[];
    octave: number = 3;
    index: number;

    constructor(index: number, octave: number) {
        this.index = index;
        this.name = notes[index];
        this.octave = octave;
    }
}

export class Interval {
    id = UUID.generate();
    length: number;
    direction: string;
    name: string;
    isPassOctave: boolean = false;
    startNote: Note;
    endNote: Note;
    octaveRange: [number, number] = [3, 5];
    #notes: { startNote: Note; endNote: Note };

    constructor(data: { length: number; name: string; octaveRange?: [number, number] }) {
        this.length = data.length;
        this.name = data.name;
        this.octaveRange = data.octaveRange ?? [3, 5];
        this.direction = Utils.randomNumber(0, 1) == 0 ? "desc" : "asc";

        this.#notes = this.setNotes();

        this.startNote = this.#notes.startNote;
        this.endNote = this.#notes.endNote;

        this.adjustlOctave = this.adjustlOctave.bind(this);
    }

    adjustlOctave({ startNote, endNote }: { startNote: Note; endNote: Note }) {
        const [octaveMin, octaveMax] = this.octaveRange;

        switch (this.direction) {
            case "asc":
                if (endNote.octave > octaveMax) {
                    startNote.octave = startNote.octave - 1;
                    endNote.octave = endNote.octave - 1;
                }
                break;
            case "desc":
                if (endNote.octave < octaveMin) {
                    startNote.octave = startNote.octave + 1;
                    endNote.octave = endNote.octave + 1;
                }
                break;
        }

        return { startNote: startNote, endNote: endNote };
    }

    setNotes() {
        const [octaveMin, octaveMax] = this.octaveRange;

        const startNote = new Note(Utils.randomNumber(0, 11), Utils.randomNumber(octaveMin, octaveMax));

        this.isPassOctave =
            this.direction == "asc"
                ? startNote.index + this.length > 11
                    ? true
                    : false
                : startNote.index - this.length < 0
                  ? true
                  : false;

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
            this.isPassOctave
                ? this.direction == "asc"
                    ? startNote.octave + 1
                    : startNote.octave - 1
                : startNote.octave,
        );
        return this.adjustlOctave({ startNote, endNote });
    }
}
