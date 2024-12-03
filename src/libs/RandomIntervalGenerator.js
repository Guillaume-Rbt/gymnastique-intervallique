import { intervals, notes } from '../utils/constantsMusical'

export default class RandomIntervalGenerator {

    allowedIntervals = null

    set allowedIntervals(value) {
        this.allowedIntervals = value
    }

    constructor(options) {
        this.setDefaultOptions = this.setDefaultOptions.bind(this)
        this.generateInterval = this.generateInterval.bind(this)
        this.randomNumber = this.randomNumber.bind(this)
        this.adjustIntervalOctave = this.adjustIntervalOctave.bind(this)

        this.setDefaultOptions(options)

        this.generateAnyIntervals = this.generateAnyIntervals.bind(this)


        this.allowedIntervals = this.options.allowedIntervals
        this.intervalsKey = Array.from(this.allowedIntervals.keys())
    }

    setDefaultOptions(options) {
        this.options = {
            allowedIntervals: 'all', //use later if implements intervals choices
            ...options,
        }
    }

    /**
     *
     * @param {number} [min=0]
     * @param {number} [max=0]
     * @returns {number}
     * @description return an int between min & max
     */
    randomNumber(min = 0, max = 1) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    generateInterval() {

        const { allowedIntervals } = this.options

        const intervalByNumber = this.randomNumber(0, this.intervalsKey.length - 1)
        const intervalKey = this.intervalsKey[intervalByNumber]
        const intervalName = allowedIntervals.get(intervalKey)
        const noteStartNumber = this.randomNumber(0, 11) // 0 == C (do) 11 = B (si)
        const noteStartName = notes[noteStartNumber] // get note name with number
        const direction = this.randomNumber(0, 1) == 0 ? 'desc' : 'asc'
        const noteEndNumber =
            direction == 'asc'
                ? noteStartNumber + intervalByNumber > 11
                    ? noteStartNumber + intervalByNumber - 12
                    : noteStartNumber + intervalByNumber
                : noteStartNumber - intervalByNumber < 0
                    ? 12 + (noteStartNumber - intervalByNumber)
                    : noteStartNumber - intervalByNumber// calc number of endNote according interval
        const noteEndName = notes[noteEndNumber]// get note name with number
        const isPassOctave =
            direction == 'asc'
                ? noteStartNumber + intervalByNumber > 11
                    ? true
                    : false
                : noteStartNumber - intervalByNumber < 0
                    ? true
                    : false
        const octave = this.randomNumber(0, 2)

        let interval = {
            length: intervalByNumber,
            direction: direction,
            name: intervalName,
            isPassOctave: isPassOctave,
            noteStart: {
                name: noteStartName,
                octave: octave,
                index: noteStartNumber,
            },
            noteEnd: {
                name: noteEndName,
                octave: isPassOctave
                    ? direction == 'asc'
                        ? octave + 1
                        : octave - 1
                    : octave,
                index: noteEndNumber,
            },
        }

        let intervalAdjusted = this.adjustIntervalOctave(interval)

        return intervalAdjusted
    }

    adjustIntervalOctave(interval) {
        switch (interval.direction) {
            case 'asc':
                if (interval.noteEnd.octave > 2) {
                    interval.noteStart.octave = interval.noteStart.octave - 1
                    interval.noteEnd.octave = interval.noteEnd.octave - 1
                }
            case 'desc':
                if (interval.noteEnd.octave < 0) {
                    interval.noteStart.octave = interval.noteStart.octave + 1
                    interval.noteEnd.octave = interval.noteEnd.octave + 1
                }
        }
        return interval
    }

    generateAnyIntervals(nbIntervals) {
        let intervals = []
        for (let i = 0; i < nbIntervals; i++) {
            intervals.push(this.generateInterval())
        }
        return intervals
    }
}
