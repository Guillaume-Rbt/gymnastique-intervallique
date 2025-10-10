import Emitter from "./emitter-mixin";

export default class IntervalPlayer extends Emitter {
    static JSON_URL = "/json/";
    static AUDIO_URL = "/audio/";

    audioContext: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    markers: { [key: string]: { offset: number; duration: number } } = {};
    buffer: AudioBuffer | null = null;

    constructor() {
        super();
    }

    async loadAudioSprite(name = "piano") {
        const [audioData, markersRes] = await Promise.all([
            fetch(`${IntervalPlayer.AUDIO_URL}${name}-notes.wav`).then((res) => res.arrayBuffer()),
            fetch(`${IntervalPlayer.JSON_URL}${name}-markers.json`).then((res) => res.json()),
        ]);

        this.markers = markersRes;
        this.buffer = await this.audioContext.decodeAudioData(audioData);
    }
}
