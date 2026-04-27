import * as Tonal from "tonal";
import { MidiNote } from "./types";
import { ChordSymbol, PitchClass } from "../harmony/types";

export function pitchClassToMidi(
  pc: PitchClass,
  octave: number
): MidiNote {
  const note = pc + String(octave);
  const midi = Tonal.Note.midi(note);
  return midi ?? 60;
}

export function midiToPitchClass(midi: MidiNote): PitchClass {
  const note = Tonal.Note.fromMidi(midi);
  return note ? note.replace(/\d/g, "") : "C";
}

export function midiToNoteName(midi: MidiNote): string {
  return Tonal.Note.fromMidi(midi) || "C4";
}

export function getChordPitchClasses(symbol: ChordSymbol): PitchClass[] {
  const chord = Tonal.Chord.get(symbol);
  if (!chord || !chord.notes) return [];
  return chord.notes;
}

export function getChordRoot(symbol: ChordSymbol): PitchClass {
  return Tonal.Chord.get(symbol)?.tonic ?? "C";
}
