import { Chord, Note } from "@tonaljs/tonal";
import type { ChordSymbol, PitchClass } from "./types";

export function getChordPitchClasses(symbol: ChordSymbol): PitchClass[] {
  const notes = Chord.get(symbol).notes;
  if (!notes.length) {
    throw new Error(`Unsupported chord symbol: ${symbol}`);
  }
  return notes.map((note) => Note.pitchClass(note));
}

export function getChordRoot(symbol: ChordSymbol): PitchClass {
  const chord = Chord.get(symbol);
  if (!chord.tonic) throw new Error(`Unsupported chord symbol: ${symbol}`);
  return Note.pitchClass(chord.tonic);
}
