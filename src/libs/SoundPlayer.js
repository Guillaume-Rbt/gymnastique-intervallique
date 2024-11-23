import Emitter from './Emitter'

export default class SoundPlayer extends Emitter {
    get SOUND_END() {
        return 'soundplayer.sound.end'
    }
    get SOUND_START() {
        return 'soundplayer.sound.start'
    }
    constructor(source) {
        super()
        this.audio = new Audio(source)
        this.interval = {
            timeNote1: 0,
            timeNote2: 1,
        }
        this.currentNote = 1
        this.emitSoundEnd = true

        this.setIntervalTimes = this.setIntervalTimes.bind(this)
        this.onAudioTimeUpdater = this.onAudioTimeUpdater.bind(this)
        this.playInterval = this.playInterval.bind(this)

        this.removeListener = this.removeListener.bind(this)

        this.addNativeListeners()
    }

    setIntervalTimes(interval) {
        this.interval = interval
        this.audio.pause()
        this.audio.currentTime = this.interval.timeNote1 / 1000
    }

    onAudioTimeUpdater() {
        if (
            this.audio.currentTime >= this.interval.timeNote1 / 1000 + 0.85 &&
            this.currentNote == 1
        ) {
            this.audio.pause()
            this.audio.currentTime = this.interval.timeNote2 / 1000
            this.emitSoundEnd = true
            this.currentNote = 2
            this.audio.play()
        } else if (
            this.currentNote == 2 &&
            this.audio.currentTime >= this.interval.timeNote2 / 1000 + 0.85
        ) {
            this.audio.pause()
            if (this.emitSoundEnd) {
                this.emit(this.SOUND_END, { interval: this.interval })
            }
        }
    }

    playInterval() {
        if (this.audio.paused) {
            this.currentNote = 1
            this.emitSoundEnd = false
            this.audio.currentTime = this.interval.timeNote1 / 1000
            this.audio.play()
            this.emit(this.SOUND_START, { interval: this.interval })
        }
    }

    addNativeListeners() {
        this.audio.addEventListener('timeupdate', this.onAudioTimeUpdater)
    }

    isPlaying() {
        return !this.audio.paused
    }
}
