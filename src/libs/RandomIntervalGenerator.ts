import { intervals, notes } from '../utils/constants'
import { randomNumber } from '../utils/numbers'

type intervalGeneratorOptions = {
    allowedIntervals: Map<number, string>
}


export default class RandomIntervalGenerator {

    options: intervalGeneratorOptions
    intervalsKey: number[]

    set allowedIntervals(value) {
        this.allowedIntervals = value
    }

    get allowedIntervals(): Map<number, string> {
        return this.options.allowedIntervals
    }

    constructor(options: Partial<intervalGeneratorOptions> = {}) {


        this.setDefaultOptions = this.setDefaultOptions.bind(this)
        this.generateInterval = this.generateInterval.bind(this)
        this.adjustIntervalOctave = this.adjustIntervalOctave.bind(this)

        this.options = this.setDefaultOptions(options)

        this.generateAnyIntervals = this.generateAnyIntervals.bind(this)


        this.allowedIntervals = this.options.allowedIntervals
        this.intervalsKey = Array.from(this.allowedIntervals.keys())
    }

    setDefaultOptions(options: Partial<intervalGeneratorOptions>) {
        const mergeOptions = {
            allowedIntervals: new Map(intervals.map((interval, index) => {
                return [index, interval]
            })),
            ...options,
        }

        return mergeOptions
    }



    generateInterval() {

        const { allowedIntervals } = this.options

        const intervalByNumber = randomNumber(0, this.intervalsKey.length - 1)

        let interval = new Interval(
            {
                length: intervalByNumber,
                name: allowedIntervals.get(this.intervalsKey[intervalByNumber]) as string
            }
        )

        return interval
    }

    adjustIntervalOctave(interval: Interval) {
        switch (interval.direction) {
            case 'asc':
                if (interval.endNote.octave > 2) {
                    interval.startNote.octave = interval.startNote.octave - 1
                    interval.endNote.octave = interval.endNote.octave - 1
                }
                break;
            case 'desc':
                if (interval.endNote.octave < 0) {
                    interval.startNote.octave = interval.startNote.octave + 1
                    interval.endNote.octave = interval.endNote.octave + 1
                }
                break;
        }
        return interval
    }

    generateAnyIntervals(nbIntervals: number = 10) {
        let intervals = []
        for (let i = 0; i < nbIntervals; i++) {
            intervals.push(this.generateInterval())
        }
        return intervals
    }
}


class Note {

    name: string | string[]
    octave: number
    index: number

    constructor(index: number, octave: number | null = null) {
        this.index = index
        this.name = notes[index]
        this.octave = octave !== null ? octave : randomNumber(0, 2)
    }
}

class Interval {
    length: number
    direction: string;
    name: string
    isPassOctave: boolean = false
    startNote: Note
    endNote: Note

    #notes: { startNote: Note, endNote: Note }

    constructor(data: { length: number, name: string }) {

        this.length = data.length
        this.name = data.name
        this.direction = randomNumber(0, 1) == 0 ? 'desc' : 'asc'
        this.#notes = this.setNotes()

        this.startNote = this.#notes.startNote
        this.endNote = this.#notes.endNote

        this.adjustlOctave = this.adjustlOctave.bind(this)
    }

    adjustlOctave() {
        switch (this.direction) {
            case 'asc':
                if (this.endNote.octave > 2) {
                    this.startNote.octave = this.startNote.octave - 1
                    this.endNote.octave = this.endNote.octave - 1
                }
                break;
            case 'desc':
                if (this.endNote.octave < 0) {
                    this.startNote.octave = this.startNote.octave + 1
                    this.endNote.octave = this.endNote.octave + 1
                }
                break;
        }
    }

    setNotes() {
        const startNote = new Note(
            randomNumber(0, 11)
        )

        this.isPassOctave = this.direction == 'asc'
            ? startNote.index + this.length > 11
                ? true
                : false
            : startNote.index - this.length < 0
                ? true
                : false

        const endNoteIndex = this.direction == 'asc'
            ? startNote.index + this.length > 11
                ? startNote.index + this.length - 12
                : startNote.index + this.length
            : startNote.index - this.length < 0
                ? 12 + (startNote.index - this.length)
                : startNote.index - this.length

        const endNote = new Note(
            endNoteIndex,
            this.isPassOctave
                ? this.direction == 'asc'
                    ? startNote.octave + 1
                    : startNote.octave - 1
                : startNote.octave)

        return { startNote, endNote }
    }
}

