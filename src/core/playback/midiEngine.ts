import { InstrumentEvent } from "../instruments/types";
import * as Tonal from "tonal";

function midiLabel(n: number): string {
  const name = Tonal.Note.fromMidi(n) ?? "?";
  return `${name}(${n})`;
}

let midiOutput: MIDIOutput | null = null;
let midiAccess: MIDIAccess | null = null;

function clearMidiOutput(output: MIDIOutput): void {
  for (let ch = 0; ch < 16; ch++) {
    output.send([0xB0 | ch, 0x7B, 0]);
  }
  if ("clear" in output && typeof (output as Record<string, unknown>).clear === "function") {
    (output as unknown as { clear(): void }).clear();
  }
}

export async function requestMidiAccess(): Promise<MIDIAccess> {
  if (midiAccess) return midiAccess;
  midiAccess = await navigator.requestMIDIAccess();
  midiAccess.onstatechange = () => {
    if (midiOutput && !Array.from(midiAccess!.outputs.values()).includes(midiOutput)) {
      midiOutput = null;
    }
  };
  return midiAccess;
}

export function getMidiOutputs(): MIDIOutput[] {
  if (!midiAccess) return [];
  return Array.from(midiAccess.outputs.values());
}

export function setMidiOutput(outputId: string): void {
  if (!midiAccess) return;
  const out = midiAccess.outputs.get(outputId);
  if (out) midiOutput = out;
}

export function getSelectedOutputId(): string | null {
  return midiOutput?.id ?? null;
}

export async function playEvents(
  events: InstrumentEvent[],
  _presetId?: string
): Promise<void> {
  if (!midiAccess) await requestMidiAccess();
  stop();
  if (!midiOutput) return;

  const now = performance.now();

  console.group(`[MIDI] playEvents (${events.length} chords)`);
  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const startMs = now + event.time * 1000;
    const endMs = startMs + event.duration * 1000;
    const vel = Math.round(Math.min(1, Math.max(0, event.velocity)) * 127);

    const labels = event.notes.map((n) => midiLabel(n)).join(" ");
    console.log(`  Chord ${i + 1}: ${labels} | t=${event.time.toFixed(2)}s dur=${event.duration.toFixed(2)}s vel=${vel}`);

    for (const note of event.notes) {
      midiOutput.send([0x90, clampMidi(note), vel], startMs);
      midiOutput.send([0x80, clampMidi(note), 0], endMs);
    }
  }
  console.groupEnd();
}

export async function playChord(
  notes: number[],
  duration: number,
  _presetId?: string,
  velocity: number = 0.7
): Promise<void> {
  if (!midiAccess) await requestMidiAccess();
  stop();
  if (!midiOutput) return;

  const now = performance.now();
  const endMs = now + duration * 1000;
  const vel = Math.round(Math.min(1, Math.max(0, velocity)) * 127);

  const labels = notes.map((n) => midiLabel(n)).join(" ");
  console.log(`[MIDI] playChord: ${labels} | dur=${duration.toFixed(2)}s vel=${vel}`);

  for (const note of notes) {
    midiOutput.send([0x90, clampMidi(note), vel], now);
    midiOutput.send([0x80, clampMidi(note), 0], endMs);
  }
}

export function stop(): void {
  if (midiOutput) {
    clearMidiOutput(midiOutput);
  }
}

export function setTempo(_bpm: number): void {}

export function getTempo(): number {
  return 72;
}

export function dispose(): void {
  stop();
  midiOutput = null;
  midiAccess = null;
}

function clampMidi(n: number): number {
  return Math.round(Math.min(127, Math.max(0, n)));
}
