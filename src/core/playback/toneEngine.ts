import * as Tone from "tone";
import * as Tonal from "tonal";
import { InstrumentEvent, InstrumentPresetId } from "../instruments/types";

const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";

const SALAMANDER_URLS = {
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

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let isInitialized = false;

const SAMPLE_MIDI_LIST = (() => {
  const list = Object.keys(SALAMANDER_URLS).map((name) => ({
    name,
    midi: Tonal.Note.midi(name) ?? 60,
  }));
  list.sort((a, b) => a.midi - b.midi);
  return list;
})();

function sampleInfo(midi: number): { sample: string; shift: number } {
  let best = SAMPLE_MIDI_LIST[0]!;
  let bestDist = Math.abs(best.midi - midi);
  for (let i = 1; i < SAMPLE_MIDI_LIST.length; i++) {
    const dist = Math.abs(SAMPLE_MIDI_LIST[i]!.midi - midi);
    if (dist < bestDist) {
      best = SAMPLE_MIDI_LIST[i]!;
      bestDist = dist;
    }
  }
  const shift = midi - best.midi;
  return { sample: best.name, shift };
}

function noteLabel(n: number): string {
  const name = Tonal.Note.fromMidi(n) ?? "?";
  const info = sampleInfo(n);
  const shiftStr = info.shift === 0 ? "0st" : (info.shift > 0 ? `+${info.shift}st` : `${info.shift}st`);
  return `${name}(${n})←${info.sample}.mp3(${shiftStr})`;
}

async function getSampler(): Promise<Tone.Sampler> {
  if (sampler) return sampler;

  return new Promise<Tone.Sampler>((resolve) => {
    reverb = new Tone.Reverb({
      decay: 2.0,
      wet: 0.2,
    }).toDestination();

    sampler = new Tone.Sampler({
      urls: SALAMANDER_URLS,
      baseUrl: SALAMANDER_BASE,
      release: 1.5,
      onload: () => {
        resolve(sampler!);
      },
    }).connect(reverb);
  });
}

export async function initAudio(): Promise<void> {
  if (!isInitialized) {
    await Tone.start();
    isInitialized = true;
  }
}

export async function playEvents(events: InstrumentEvent[], presetId: InstrumentPresetId): Promise<void> {
  await initAudio();
  stop();
  clearScheduled();

  const s = await getSampler();
  const now = Tone.now();

  console.group(`[Sampler] playEvents (${events.length} chords, preset: ${presetId})`);
  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const labels = event.notes.map((n) => noteLabel(n)).join(" ");
    console.log(`  Chord ${i + 1}: ${labels} | t=${event.time.toFixed(2)}s dur=${event.duration.toFixed(2)}s`);
    s.triggerAttackRelease(
      event.notes.map((n) => Tone.Frequency(n, "midi").toFrequency()),
      event.duration,
      now + event.time,
      event.velocity
    );
  }
  console.groupEnd();
}

export async function playChord(
  notes: number[],
  duration: number,
  presetId: InstrumentPresetId,
  velocity: number = 0.7
): Promise<void> {
  await initAudio();
  const s = await getSampler();
  const now = Tone.now();

  const labels = notes.map((n) => noteLabel(n)).join(" ");
  console.log(`[Sampler] playChord: ${labels} | dur=${duration.toFixed(2)}s preset=${presetId}`);

  s.triggerAttackRelease(
    notes.map((n) => Tone.Frequency(n, "midi").toFrequency()),
    duration,
    now,
    velocity
  );
}

let scheduledIds: number[] = [];

export function scheduleEvents(events: InstrumentEvent[], presetId: InstrumentPresetId): void {
  clearScheduled();
  const s = sampler;
  if (!s) return;

  for (const event of events) {
    const id = Tone.Transport.schedule((time) => {
      s.triggerAttackRelease(
        event.notes.map((n) => Tone.Frequency(n, "midi").toFrequency()),
        event.duration,
        time,
        event.velocity
      );
    }, event.time);
    scheduledIds.push(id as unknown as number);
  }
}

export function startTransport(): void {
  Tone.Transport.start();
}

export function stop(): void {
  if (sampler) {
    sampler.releaseAll();
    sampler.dispose();
    sampler = null;
  }
  if (reverb) {
    reverb.dispose();
    reverb = null;
  }
  clearScheduled();
}

export function setTempo(bpm: number): void {
  Tone.Transport.bpm.value = bpm;
}

export function getTempo(): number {
  return Tone.Transport.bpm.value;
}

function clearScheduled(): void {
  scheduledIds = [];
}

export function dispose(): void {
  stop();
}

export function getUserMediaInit(): void {
  initAudio();
}
