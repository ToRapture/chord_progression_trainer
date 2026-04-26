import type { InstrumentEvent, InstrumentPresetId, MidiNote } from "../voicing/types";

type MIDIOutputLike = {
  id: string;
  name?: string;
  send: (data: number[], timestamp?: number) => void;
  clear?: () => void;
};

type MIDIAccessLike = {
  outputs: {
    values: () => IterableIterator<MIDIOutputLike>;
  };
};

let midiAccess: MIDIAccessLike | null = null;
let currentOutput: MIDIOutputLike | null = null;

function navWithMidi(): Navigator & { requestMIDIAccess?: () => Promise<unknown> } {
  return navigator as Navigator & { requestMIDIAccess?: () => Promise<unknown> };
}

export async function requestMidiAccess(): Promise<MIDIAccessLike> {
  const request = navWithMidi().requestMIDIAccess;
  if (!request) throw new Error("Web MIDI API is not available in this browser.");
  midiAccess = (await request()) as MIDIAccessLike;
  if (!currentOutput) currentOutput = getMidiOutputs()[0] ?? null;
  return midiAccess;
}

export function getMidiOutputs(): MIDIOutputLike[] {
  return midiAccess ? Array.from(midiAccess.outputs.values()) : [];
}

export function setMidiOutput(outputId: string): void {
  currentOutput = getMidiOutputs().find((output) => output.id === outputId) ?? null;
}

function noteOn(note: MidiNote, velocity: number): number[] {
  return [0x90, note, Math.round(velocity * 127)];
}

function noteOff(note: MidiNote): number[] {
  return [0x80, note, 0];
}

export async function playEvents(events: InstrumentEvent[]): Promise<void> {
  if (!midiAccess) await requestMidiAccess();
  if (!currentOutput) throw new Error("No MIDI output selected.");
  const start = performance.now() + 50;
  events.forEach((event) => {
    event.notes.forEach((note, noteIndex) => {
      const strumOffset = event.articulation === "strum" ? noteIndex * 25 : 0;
      currentOutput?.send(noteOn(note, event.velocity), start + event.time * 1000 + strumOffset);
      currentOutput?.send(noteOff(note), start + (event.time + event.duration) * 1000 + strumOffset);
    });
  });
}

export async function playChord(notes: MidiNote[], duration: number, _presetId?: InstrumentPresetId, velocity = 0.75): Promise<void> {
  void _presetId;
  if (!midiAccess) await requestMidiAccess();
  if (!currentOutput) throw new Error("No MIDI output selected.");
  const start = performance.now() + 20;
  notes.forEach((note) => {
    currentOutput?.send(noteOn(note, velocity), start);
    currentOutput?.send(noteOff(note), start + duration * 1000);
  });
}

export function stop(): void {
  if (!currentOutput) return;
  for (let channel = 0; channel < 16; channel += 1) currentOutput.send([0xb0 + channel, 123, 0]);
  currentOutput.clear?.();
}

export function dispose(): void {
  stop();
  currentOutput = null;
}

export const midiEngine = { requestMidiAccess, getMidiOutputs, setMidiOutput, playEvents, playChord, stop, dispose };
