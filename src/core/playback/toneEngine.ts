import * as Tone from "tone";
import type { InstrumentEvent, InstrumentPresetId } from "../voicing/types";

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let initialized = false;
let tempo = 100;

const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";

const SAMPLES: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
  "D#7": "Ds7.mp3",
  "F#7": "Fs7.mp3",
  A7: "A7.mp3",
};

export async function initAudio(): Promise<void> {
  if (initialized) return;
  await Tone.start();
  initialized = true;
}

function getSampler(): Tone.Sampler {
  if (sampler && reverb) return sampler;
  reverb = new Tone.Reverb({ decay: 2.0, wet: 0.2 }).toDestination();
  sampler = new Tone.Sampler({
    urls: SAMPLES,
    baseUrl: SALAMANDER_BASE,
  }).connect(reverb);
  return sampler;
}

export async function playEvents(
  events: InstrumentEvent[],
  _preset: InstrumentPresetId,
): Promise<void> {
  await initAudio();
  const s = getSampler();
  await Tone.loaded();
  const now = Tone.now() + 0.05;
  for (const ev of events) {
    const noteNames = ev.notes.map((m) =>
      Tone.Frequency(m, "midi").toNote(),
    );
    s.triggerAttackRelease(
      noteNames,
      ev.duration,
      now + ev.time,
      ev.velocity / 127,
    );
  }
}

export async function playChord(
  notes: number[],
  duration: number,
  _preset: InstrumentPresetId,
  velocity = 90,
): Promise<void> {
  await initAudio();
  const s = getSampler();
  await Tone.loaded();
  const noteNames = notes.map((m) => Tone.Frequency(m, "midi").toNote());
  s.triggerAttackRelease(
    noteNames,
    duration,
    Tone.now() + 0.05,
    velocity / 127,
  );
}

export function stop(): void {
  if (sampler) {
    sampler.dispose();
    sampler = null;
  }
  if (reverb) {
    reverb.dispose();
    reverb = null;
  }
}

export function setTempo(bpm: number): void {
  tempo = bpm;
  Tone.Transport.bpm.value = bpm;
}

export function getTempo(): number {
  return tempo;
}

export function dispose(): void {
  stop();
}
