import { Note } from "@tonaljs/tonal";
import type { ChordSymbol, KeySignature, RomanNumeral } from "./types";
import { parseRoman, type ChordQuality, type SeventhType } from "./roman";

const MAJOR_INTERVALS = ["1P", "2M", "3M", "4P", "5P", "6M", "7M"];
const NATURAL_MINOR_INTERVALS = ["1P", "2M", "3m", "4P", "5P", "6m", "7m"];

function degreeRoot(tonic: string, degree: number, isMinor: boolean): string {
  const intervals = isMinor ? NATURAL_MINOR_INTERVALS : MAJOR_INTERVALS;
  const interval = intervals[degree - 1];
  const note = Note.transpose(tonic, interval);
  return Note.pitchClass(note);
}

function qualitySuffix(q: ChordQuality, s: SeventhType): string {
  if (s === "maj7") return "maj7";
  if (s === "dom7") return "7";
  if (s === "min7") return "m7";
  if (s === "halfDim7") return "m7b5";
  if (s === "dim7") return "dim7";
  if (q === "diminished") return "dim";
  if (q === "halfDim") return "m7b5";
  if (q === "augmented") return "aug";
  if (q === "minor") return "m";
  return "";
}

export function romanToChordSymbol(
  roman: RomanNumeral,
  key: KeySignature,
): ChordSymbol {
  const parsed = parseRoman(roman);
  const isMinor = key.mode === "minor";
  let root = degreeRoot(key.tonic, parsed.degree, isMinor);

  if (isMinor && parsed.degree === 7 && parsed.quality === "diminished") {
    root = Note.pitchClass(Note.transpose(root, "1A"));
  }

  if (parsed.flat) {
    root = Note.pitchClass(Note.transpose(root, "1d"));
  }

  return root + qualitySuffix(parsed.quality, parsed.seventh);
}

export function romanProgressionToChordSymbols(
  progression: RomanNumeral[],
  key: KeySignature,
): ChordSymbol[] {
  return progression.map((r) => romanToChordSymbol(r, key));
}
