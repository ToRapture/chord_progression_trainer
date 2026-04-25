import * as Tonal from "tonal";
import { ChordSymbol, NoteName, PitchClass } from "./types";

export function chordRoot(symbol: ChordSymbol): NoteName {
  return Tonal.Chord.get(symbol)?.tonic ?? symbol;
}

export function chordNotes(symbol: ChordSymbol): PitchClass[] {
  return Tonal.Chord.get(symbol)?.notes ?? [];
}

export function chordIntervals(symbol: ChordSymbol): string[] {
  return Tonal.Chord.get(symbol)?.intervals ?? [];
}

export function isTriad(symbol: ChordSymbol): boolean {
  const intervals = chordIntervals(symbol);
  return intervals.length === 3;
}

export function isSeventh(symbol: ChordSymbol): boolean {
  const intervals = chordIntervals(symbol);
  return intervals.length === 4;
}

export function normalizeChordSymbol(symbol: ChordSymbol): ChordSymbol {
  return Tonal.Chord.detect(chordNotes(symbol))[0] ?? symbol;
}

export function getChordQuality(symbol: ChordSymbol): string {
  return Tonal.Chord.get(symbol)?.quality ?? "unknown";
}

export function symbolToMidi(symbol: ChordSymbol, octave: number): number[] {
  const notes = chordNotes(symbol);
  return notes.map((n) => {
    const midi = Tonal.Note.midi(n + String(octave));
    return midi ?? 60;
  });
}

export function noteToMidi(note: string): number {
  return Tonal.Note.midi(note) ?? 60;
}

export function midiToNote(midi: number): string {
  return Tonal.Note.fromMidi(midi) || "";
}

export function intervalBetween(note1: NoteName, note2: NoteName): number {
  const midi1 = Tonal.Note.midi(note1 + "4");
  const midi2 = Tonal.Note.midi(note2 + "4");
  if (midi1 === null || midi2 === null) return 0;
  return Math.abs(midi2 - midi1);
}
