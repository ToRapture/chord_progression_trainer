import * as Tone from "tone";
import type { InstrumentEvent, InstrumentPresetId, MidiNote } from "../voicing/types";
import { midiToName } from "../voicing/pitchUtils";

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let tempo = 84;

const SAMPLE_URLS: Record<string, string> = {
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

async function getSampler(): Promise<Tone.Sampler> {
  if (sampler) return sampler;
  reverb = new Tone.Reverb({ decay: 2, wet: 0.2 }).toDestination();
  sampler = new Tone.Sampler({
    urls: SAMPLE_URLS,
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).connect(reverb);
  await Tone.loaded();
  return sampler;
}

export async function initAudio(): Promise<void> {
  await Tone.start();
  await getSampler();
}

export async function playEvents(events: InstrumentEvent[]): Promise<void> {
  await initAudio();
  const s = await getSampler();
  const now = Tone.now() + 0.05;
  events.forEach((event) => {
    const notes = event.notes.map(midiToName);
    const offsetNotes = event.articulation === "strum" ? notes : [notes];
    if (event.articulation === "strum") {
      offsetNotes.forEach((note, index) => s.triggerAttackRelease(note as string, event.duration, now + event.time + index * 0.025, event.velocity));
    } else {
      s.triggerAttackRelease(notes, event.duration, now + event.time, event.velocity);
    }
  });
}

export async function playChord(notes: MidiNote[], duration: number, _presetId?: InstrumentPresetId, velocity = 0.75): Promise<void> {
  void _presetId;
  await initAudio();
  const s = await getSampler();
  s.triggerAttackRelease(notes.map(midiToName), duration, Tone.now() + 0.02, velocity);
}

export function stop(): void {
  sampler?.dispose();
  reverb?.dispose();
  sampler = null;
  reverb = null;
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

export const toneEngine = { initAudio, playEvents, playChord, stop, setTempo, getTempo, dispose };
