import { utils } from "animejs";
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
    private settle: { resolve: (data: { status: "ended" | "aborted" }) => void; reject: (e: Error) => void } | null =
        null;
    private masterGain: GainNode;
    private playToken = 0;
    private aborting = false;

    set volume(value: number) {
        this.masterGain.gain.value = utils.clamp(value, 0, 1);
    }

    get volume(): number {
        return this.masterGain.gain.value;
    }
    constructor() {
        super();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 1.0;
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
        this.createSequenceFromNotes(
            [
                `${interval.startNote.name}${interval.startNote.octave}`,
                `${interval.endNote.name}${interval.endNote.octave}`,
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
    createSequenceFromInterval(interval: Interval, gapMs = 0): PlanStep[] {
        return this.createSequenceFromNotes(
            [
                `${interval.startNote.name[0]}${interval.startNote.octave}`,
                `${interval.endNote.name[0]}${interval.endNote.octave}`,
            ],
            gapMs,
        );
    }

    // playSequence
    playSequence(startDelayMs = 0): Promise<{ status: "ended" | "aborted" }> {
        this.requireReady();
        if (!this.plan.length) throw new Error("No sequence. Call createSequence*() first.");

        this.clear(); // will resolve "aborted"

        const ac = this.audioContext;
        const buffer = this.buffer!;
        const startAt = ac.currentTime + startDelayMs / 1000;

        // new token for this playback
        const token = ++this.playToken;

        this.playing = true;
        this.emit(Sequencer.EVENTS.SEQUENCE_START, { at: startAt });

        let resolve!: (v: { status: "ended" | "aborted" }) => void;
        let reject!: (e: Error) => void;
        const done = new Promise<{ status: "ended" | "aborted" }>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.settle = { resolve, reject };

        this.plan.forEach((step, i) => {
            const src = ac.createBufferSource();
            src.buffer = buffer;

            const gain = ac.createGain();
            src.connect(gain).connect(this.masterGain);

            const when = startAt + step.startDelayMs / 1000;
            this.applyMiniFade(gain, when, step.durationMs);
            src.start(when, step.offsetMs / 1000, step.durationMs / 1000);

            if (i === this.plan.length - 1) {
                src.onended = () => {
                    // only emit "end" if: same token, no abort in progress, still playing
                    if (this.playing && !this.aborting && this.settle && token === this.playToken) {
                        this.playing = false;
                        this.emit(Sequencer.EVENTS.SEQUENCE_END);
                        this.settle.resolve({ status: "ended" });
                        this.settle = null;
                    }
                };
            }

            this.active.push({ src, gain });
        });

        return done;
    }

    // clear: stop handlers + invalidate properly
    clear() {
        // neutralize all onended before stop()
        for (const { src } of this.active) {
            try {
                src.onended = null;
            } catch {}
        }

        // stop/disconnect
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

        if (this.playing && this.settle) {
            this.aborting = true;
            this.emit(Sequencer.EVENTS.SEQUENCE_ABORT);
            this.settle.resolve({ status: "aborted" });
            this.settle = null;
            this.aborting = false;
        }

        this.playing = false;
        // invalidate any late ending still programmed
        this.playToken++;
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
