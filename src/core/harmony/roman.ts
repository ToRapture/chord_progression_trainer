import * as Tonal from "tonal";
import { ChordInKey, MusicalKey, RomanNumeralSymbol, ChordSymbol, ScaleDegree, NoteName, PitchClass, HarmonicFunction } from "./types";
import { getFunctionGroup } from "./functionGroups";

const MAJOR_ROMAN_ORDER: RomanNumeralSymbol[] = [
  "I", "ii", "iii", "IV", "V", "vi", "vii°",
];

const NATURAL_MINOR_ROMAN_ORDER: RomanNumeralSymbol[] = [
  "i", "ii°", "III", "iv", "v", "VI", "VII",
];

const HARMONIC_MINOR_ROMAN_ORDER: RomanNumeralSymbol[] = [
  "i", "ii°", "III+", "iv", "V", "VI", "vii°",
];

export function romanToChordSymbol(
  roman: RomanNumeralSymbol,
  key: MusicalKey
): ChordSymbol {
  if (key.mode === "major") {
    const keyObj = Tonal.Key.majorKey(key.tonic);
    const triads = keyObj.triads;
    const idx = MAJOR_ROMAN_ORDER.indexOf(roman);
    if (idx >= 0 && idx < triads.length) {
      return triads[idx]!;
    }
    return roman;
  }

  const keyObj = Tonal.Key.minorKey(key.tonic);
  const naturalTriads = keyObj.natural.triads as string[];
  const harmonicTriads = keyObj.harmonic.triads as string[];

  const naturalIdx = NATURAL_MINOR_ROMAN_ORDER.indexOf(roman);
  if (naturalIdx >= 0 && naturalIdx < naturalTriads.length) {
    return naturalTriads[naturalIdx]!;
  }

  const harmonicIdx = HARMONIC_MINOR_ROMAN_ORDER.indexOf(roman);
  if (harmonicIdx >= 0 && harmonicIdx < harmonicTriads.length) {
    return harmonicTriads[harmonicIdx]!;
  }

  return roman;
}

export function chordSymbolToPitchClasses(chordSymbol: ChordSymbol): PitchClass[] {
  const chord = Tonal.Chord.get(chordSymbol);
  if (!chord || !chord.notes) return [];
  return chord.notes;
}

export function getScaleDegree(roman: RomanNumeralSymbol): ScaleDegree {
  const cleaned = roman.replace(/[7majb#ø°+]/g, "");
  const mapping: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
    i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
    bIII: 3, bVI: 6, bVII: 7,
  };
  return mapping[cleaned] ?? 1;
}

export function isDiatonicRoman(roman: RomanNumeralSymbol, mode: "major" | "minor"): boolean {
  if (mode === "major") {
    return MAJOR_ROMAN_ORDER.includes(roman) || MAJOR_ROMAN_ORDER.some((r) => r === roman.replace(/7|maj7|m7/g, ""));
  }
  const natural = NATURAL_MINOR_ROMAN_ORDER;
  const harmonic = ["V", "V7", "vii°"];
  return natural.includes(roman) || harmonic.includes(roman);
}

export function romanToChordInKey(
  roman: RomanNumeralSymbol,
  key: MusicalKey
): ChordInKey {
  const symbol = romanToChordSymbol(roman, key);
  const chordTones = chordSymbolToPitchClasses(symbol);
  const scaleDegree = getScaleDegree(roman);
  const functionGroup = getFunctionGroup(roman, key.mode);

  let source: ChordInKey["source"] = "diatonic";
  if (key.mode === "minor" && (roman === "V" || roman === "V7" || roman === "vii°")) {
    source = "harmonic_minor";
  }

  return {
    roman,
    symbol,
    functionGroup,
    scaleDegree,
    chordTones,
    source,
  };
}

export function progressionToChordSymbols(
  romanProgression: RomanNumeralSymbol[],
  key: MusicalKey
): ChordSymbol[] {
  return romanProgression.map((r) => romanToChordSymbol(r, key));
}

export function romanNoteToMidi(roman: RomanNumeralSymbol, octave: number, key: MusicalKey): number {
  const symbol = romanToChordSymbol(roman, key);
  const root = Tonal.Chord.get(symbol)?.tonic ?? symbol;
  const noteName = root + String(octave);
  const midi = Tonal.Note.midi(noteName);
  return midi ?? 60;
}
