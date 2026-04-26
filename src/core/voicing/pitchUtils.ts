import { Note } from "@tonaljs/tonal";
import type { MidiNote, VoicedChord } from "./types";

export function midiToName(midi: MidiNote): string {
  return Note.fromMidi(midi);
}

export function pitchClassToMidiInRange(pc: string, range: [MidiNote, MidiNote], preferLow = true): MidiNote {
  const candidates: MidiNote[] = [];
  for (let midi = range[0]; midi <= range[1]; midi += 1) {
    if (Note.pitchClass(Note.fromMidi(midi)) === pc) candidates.push(midi);
  }
  if (!candidates.length) {
    throw new Error(`No MIDI note for ${pc} in range ${range.join("-")}`);
  }
  return preferLow ? candidates[0] : candidates[Math.floor(candidates.length / 2)];
}

export function pitchClassSetFromMidi(notes: MidiNote[]): string[] {
  return notes.map((note) => Note.pitchClass(Note.fromMidi(note)));
}

export function totalUpperMovement(previous: VoicedChord | null, candidate: VoicedChord): number {
  if (!previous) return 0;
  const length = Math.min(previous.upperVoices.length, candidate.upperVoices.length);
  let total = 0;
  for (let i = 0; i < length; i += 1) total += Math.abs(previous.upperVoices[i] - candidate.upperVoices[i]);
  return total;
}
