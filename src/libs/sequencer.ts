import Emitter from "./emitter-mixin";
import type { Interval } from "./interval-generator";

type Marker = { name: string; offset: number; duration: number };
type PlanStep = { name: string; offsetMs: number; durationMs: number; startDelayMs: number };

export default class Sequencer extends Emitter {
    static JSON_URL = "/json/";
    static AUDIO_URL = "/audio/";

    static EVENTS = {
        AUDIO_READY: "audio.ready",
        SEQUENCE_CREATED: "sequence.created",
        SEQUENCE_START: "sequence.start",
        SEQUENCE_END: "sequence.end",
        SEQUENCE_ABORT: "sequence.abort",
    };

    audioContext: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    markers: Marker[] = [];
    buffer: AudioBuffer | null = null;

    // --- Sequencer state ---
    private plan: PlanStep[] = [];
    private active: Array<{ src: AudioBufferSourceNode; gain: GainNode }> = [];
    private playing = false;
    private settle: { resolve: () => void; reject: (e: Error) => void } | null = null;

    constructor() {
        super();
    }

    async loadAudioSprite(name = "piano") {
        const [audioData, markersRes] = await Promise.all([
            fetch(`${Sequencer.AUDIO_URL}${name}-notes.wav`).then((res) => res.arrayBuffer()),
            fetch(`${Sequencer.JSON_URL}${name}-markers.json`).then((res) => res.json()),
        ]);

        this.markers = markersRes as Marker[];
        this.buffer = await this.audioContext.decodeAudioData(audioData);
        this.emit(Sequencer.EVENTS.AUDIO_READY, { name, markersCount: this.markers.length });
    }

    private requireReady() {
        if (!this.buffer) throw new Error("Audio buffer not loaded. Call loadAudioSprite() first.");
        if (!this.markers?.length) throw new Error("Markers not loaded.");
    }

    applyMiniFade(gainNode: GainNode, t0: number, durMs: number, fadeMs = 5) {
        const fade = fadeMs / 1000;
        const dur = durMs / 1000;
        const g = gainNode.gain;
        g.setValueAtTime(0.0001, t0);
        g.exponentialRampToValueAtTime(1.0, t0 + fade);
        const tEnd = t0 + dur;
        g.setValueAtTime(1.0, tEnd - fade);
        g.exponentialRampToValueAtTime(0.0001, tEnd);
    }

    // --- Existing simple API: play an interval immediately (2 chained notes) ---
    playInterval(interval: Interval, gapMs = 100) {
        console.log(interval);

        this.createSequenceFromNotes(
            [
                `${interval.startNote.name[0]}${interval.startNote.octave}`,
                `${interval.endNote.name[0]}${interval.endNote.octave}`,
            ],
            gapMs,
        );
        return this.playSequence(0); // returns a Promise<void>
    }

    // --- 1) Create a sequence (without playing) from an array of note names ---
    //   - notes can be ["C4","E4","G4"] or [{name:"C4", gapAfterMs:50}, ...]
    createSequenceFromNotes(notes: Array<string | { name: string; gapAfterMs?: number }>, gapMs = 0): PlanStep[] {
        this.requireReady();
        this.plan = [];
        let cursorMs = 0;

        for (const item of notes) {
            const name = typeof item === "string" ? item : item.name;
            const m = this.markers.find((x) => x.name === name);
            if (!m) {
                console.warn(`[Sequencer] Marker not found for note "${name}"`);
                continue;
            }
            this.plan.push({
                name,
                offsetMs: m.offset,
                durationMs: m.duration,
                startDelayMs: cursorMs,
            });

            const extraGap = typeof item === "object" && item.gapAfterMs != null ? item.gapAfterMs : gapMs;

            cursorMs += m.duration + extraGap;
        }

        this.emit(Sequencer.EVENTS.SEQUENCE_CREATED, { steps: this.plan.length, totalMs: cursorMs });
        return [...this.plan];
    }

    // --- Helper: create a sequence from an Interval (without playing) ---
    createSequenceFromInterval(interval: Interval, gapMs = 100): PlanStep[] {
        return this.createSequenceFromNotes(
            [
                `${interval.startNote.name[0]}${interval.startNote.octave}`,
                `${interval.endNote.name[0]}${interval.endNote.octave}`,
            ],
            gapMs,
        );
    }

    // --- 2) Play the current sequence (returns Promise resolved at the end) ---
    playSequence(startDelayMs = 0): Promise<void> {
        this.requireReady();
        if (!this.plan.length) throw new Error("No sequence. Call createSequence*() first.");

        // if something is already playing, we stop it cleanly
        this.clear();

        const buffer = this.buffer!;
        const ac = this.audioContext;
        const startAt = ac.currentTime + startDelayMs / 1000;

        this.playing = true;
        this.emit(Sequencer.EVENTS.SEQUENCE_START, { at: startAt });

        let resolve!: () => void;
        let reject!: (e: Error) => void;
        const done = new Promise<void>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.settle = { resolve, reject };

        this.plan.forEach((step, i) => {
            const src = ac.createBufferSource();
            src.buffer = buffer;

            const gain = ac.createGain();
            src.connect(gain).connect(ac.destination);

            const when = startAt + step.startDelayMs / 1000;
            this.applyMiniFade(gain, when, step.durationMs);

            // start(when, offsetSec, durationSec)
            src.start(when, step.offsetMs / 1000, step.durationMs / 1000);

            if (i === this.plan.length - 1) {
                src.onended = () => {
                    if (this.playing && this.settle) {
                        this.playing = false;
                        this.emit(Sequencer.EVENTS.SEQUENCE_END);
                        this.settle.resolve();
                        this.settle = null;
                    }
                };
            }

            this.active.push({ src, gain });
        });

        return done;
    }

    // --- 3) Clear: stop everything and reset the player state ---
    clear() {
        // stop all scheduled/running sources
        for (const { src, gain } of this.active) {
            try {
                src.stop(0);
            } catch {}
            try {
                src.disconnect();
            } catch {}
            try {
                gain.disconnect();
            } catch {}
        }
        this.active = [];

        // reject the current promise if we were interrupting a playback
        if (this.playing && this.settle) {
            this.emit(Sequencer.EVENTS.SEQUENCE_ABORT);
            this.settle.reject(new Error("sequence_cleared"));
            this.settle = null;
        }
        this.playing = false;
    }

    // --- Utilitaires ---
    isPlaying() {
        return this.playing;
    }
    getPlan(): PlanStep[] {
        return [...this.plan];
    }

    // Optional: play a single note (without affecting the sequence)
    playNote(name: string, delayMs = 0) {
        this.requireReady();
        const m = this.markers.find((x) => x.name === name);
        if (!m) return;

        const ac = this.audioContext;
        const src = ac.createBufferSource();
        src.buffer = this.buffer!;
        const gain = ac.createGain();
        src.connect(gain).connect(ac.destination);

        const when = ac.currentTime + delayMs / 1000;
        this.applyMiniFade(gain, when, m.duration);
        src.start(when, m.offset / 1000, m.duration / 1000);

        // cleanup after end
        src.onended = () => {
            try {
                src.disconnect();
                gain.disconnect();
            } catch {}
        };
    }
}
