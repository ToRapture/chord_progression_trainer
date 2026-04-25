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

function scaleDegreeToNote(
  degree: number,
  key: MusicalKey
): string {
  if (key.mode === "major") {
    const scale = Tonal.Key.majorKey(key.tonic).scale;
    return scale[degree - 1] ?? key.tonic;
  }
  const scale = Tonal.Key.minorKey(key.tonic).natural.scale as string[];
  return scale[degree - 1] ?? key.tonic;
}

function analyzeRomanChar(roman: string): {
  degree: number;
  isUpper: boolean;
  suffix: string;
  baseQuality: string;
} {
  const cleaned = roman.replace(/[7majb#ø°+]/g, "");
  const upper = /^[A-Z]/.test(cleaned);
  const degreeMap: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
    i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
    bIII: 3, bVI: 6, bVII: 7,
  };
  const degree = degreeMap[cleaned] ?? 1;

  let baseQuality = "";
  if (/^[IV]+$/.test(cleaned)) {
    baseQuality = upper ? "M" : "m";
  } else if (/^[iv]+$/.test(cleaned)) {
    baseQuality = "m";
  }

  if (roman.includes("+")) baseQuality = "aug";
  if (roman.includes("°") || roman.includes("ø")) baseQuality = "dim";

  let suffix = "";
  if (roman.endsWith("ø7")) suffix = "ø7";
  else if (roman.endsWith("°7")) suffix = "°7";
  else if (roman.endsWith("maj7")) suffix = "maj7";
  else if (roman.endsWith("m7")) suffix = "m7";
  else if (roman.endsWith("7")) suffix = "7";

  return { degree, isUpper: upper, suffix, baseQuality };
}

function buildChordSymbol(
  root: string,
  quality: string,
  suffix: string
): string {
  const base = root;
  if (suffix === "maj7") return base + "maj7";
  if (suffix === "m7") return base + "m7";
  if (suffix === "7") {
    if (quality === "M") return base + "7";
    if (quality === "m") return base + "m7";
    if (quality === "dim") return base + "m7b5";
    if (quality === "aug") return base + "7";
    return base + "7";
  }
  if (suffix === "ø7" || suffix === "°7") {
    if (quality === "dim") return base + "dim7";
    return base + "m7b5";
  }
  // No suffix: triad
  if (quality === "M") return base;
  if (quality === "m") return base + "m";
  if (quality === "dim") return base + "dim";
  if (quality === "aug") return base + "aug";
  return base;
}

export function romanToChordSymbol(
  roman: RomanNumeralSymbol,
  key: MusicalKey
): ChordSymbol {
  const { degree, suffix, baseQuality } = analyzeRomanChar(roman);
  const root = scaleDegreeToNote(degree, key);

  const symbol = buildChordSymbol(root, baseQuality, suffix);

  const chord = Tonal.Chord.get(symbol);
  if (chord && !chord.empty && chord.notes.length > 0) {
    return symbol;
  }

  // Fallback: try constructing via Tonal's Key.triads for diatonic romans
  if (key.mode === "major") {
    const keyObj = Tonal.Key.majorKey(key.tonic);
    const triads = keyObj.triads as string[];
    const idx = MAJOR_ROMAN_ORDER.indexOf(roman);
    if (idx >= 0 && idx < triads.length) return triads[idx]!;
  } else {
    const keyObj = Tonal.Key.minorKey(key.tonic);
    const nTriads = keyObj.natural.triads as string[];
    const hTriads = keyObj.harmonic.triads as string[];
    let idx = NATURAL_MINOR_ROMAN_ORDER.indexOf(roman);
    if (idx >= 0 && idx < nTriads.length) return nTriads[idx]!;
    idx = HARMONIC_MINOR_ROMAN_ORDER.indexOf(roman);
    if (idx >= 0 && idx < hTriads.length) return hTriads[idx]!;
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
