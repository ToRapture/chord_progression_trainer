import { Chord, Note } from "@tonaljs/tonal";
import type { ChordInKey, KeySignature, PitchClass, RomanNumeral } from "./types";
import { getFunctionGroup } from "./functionGroups";

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];
const ROMAN_BASE: Record<string, number> = {
  I: 0,
  II: 1,
  III: 2,
  IV: 3,
  V: 4,
  VI: 5,
  VII: 6,
};

type ParsedRoman = {
  accidental: number;
  numeral: string;
  quality: "major" | "minor" | "diminished" | "half-diminished";
  seventh: "none" | "7" | "maj7";
};

export function parseRoman(roman: RomanNumeral): ParsedRoman | null {
  const match = roman.match(/^(bb|b|##|#)?([ivIV]+)(maj7|ø7|°7|7|°)?$/);
  if (!match) return null;
  const accidentalToken = match[1] ?? "";
  const numeral = match[2];
  const suffix = match[3] ?? "";
  const upper = numeral.toUpperCase();
  if (!(upper in ROMAN_BASE)) return null;

  const accidental = accidentalToken === "bb" ? -2 : accidentalToken === "b" ? -1 : accidentalToken === "#" ? 1 : accidentalToken === "##" ? 2 : 0;
  const quality = suffix.startsWith("ø")
    ? "half-diminished"
    : suffix.startsWith("°")
      ? "diminished"
      : numeral === upper
        ? "major"
        : "minor";
  const seventh = suffix === "maj7" ? "maj7" : suffix.includes("7") ? "7" : "none";

  return { accidental, numeral: upper, quality, seventh };
}

export function romanScaleDegree(roman: RomanNumeral): number {
  const parsed = parseRoman(roman);
  if (!parsed) return 0;
  return ROMAN_BASE[parsed.numeral] + 1;
}

export function romanToChordSymbol(roman: RomanNumeral, key: KeySignature): string {
  const parsed = parseRoman(roman);
  if (!parsed) throw new Error(`Invalid roman numeral: ${roman}`);

  const degreeIndex = ROMAN_BASE[parsed.numeral];
  const steps = key.mode === "major" ? MAJOR_STEPS : MINOR_STEPS;
  const tonicMidi = Note.midi(`${key.tonic}4`);
  if (tonicMidi == null) throw new Error(`Invalid tonic: ${key.tonic}`);

  const rootMidi = tonicMidi + steps[degreeIndex] + parsed.accidental;
  const root = Note.pitchClass(Note.fromMidi(rootMidi));
  let quality = "";

  if (parsed.quality === "minor") quality = "m";
  if (parsed.quality === "diminished") quality = "dim";
  if (parsed.quality === "half-diminished") quality = "m7b5";
  if (parsed.seventh === "7") quality = parsed.quality === "minor" ? "m7" : parsed.quality === "diminished" ? "dim7" : parsed.quality === "half-diminished" ? "m7b5" : "7";
  if (parsed.seventh === "maj7") quality = parsed.quality === "minor" ? "mMaj7" : "maj7";

  return `${root}${quality}`;
}

export function chordTonesForSymbol(symbol: string): PitchClass[] {
  const chord = Chord.get(symbol);
  if (!chord.notes.length) throw new Error(`Cannot resolve chord symbol: ${symbol}`);
  return chord.notes.map((note) => Note.pitchClass(note));
}

export function romanToChordInKey(roman: RomanNumeral, key: KeySignature): ChordInKey {
  const symbol = romanToChordSymbol(roman, key);
  const parsed = parseRoman(roman);
  const source = key.mode === "minor" && (roman === "V" || roman === "V7" || roman === "vii°") ? "harmonic_minor" : parsed?.accidental ? "borrowed" : "diatonic";
  return {
    roman,
    symbol,
    functionGroup: getFunctionGroup(roman, key.mode),
    scaleDegree: romanScaleDegree(roman),
    chordTones: chordTonesForSymbol(symbol),
    source,
  };
}

export function renderRomanProgression(romans: RomanNumeral[], key: KeySignature): string[] {
  return romans.map((roman) => romanToChordSymbol(roman, key));
}
