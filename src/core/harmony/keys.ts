import type { Mode, RomanNumeral } from "./types";

export const MAJOR_KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export const MINOR_KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export const MAJOR_VOCAB: RomanNumeral[] = [
  "I", "ii", "iii", "IV", "V", "V7", "vi", "vii°",
];

export const MINOR_VOCAB: RomanNumeral[] = [
  "i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°",
];

export const EXTENDED_MAJOR_VOCAB: RomanNumeral[] = [
  ...MAJOR_VOCAB,
  "Imaj7", "ii7", "iii7", "IVmaj7", "vi7", "viiø7", "VI7",
];

export const EXTENDED_MINOR_VOCAB: RomanNumeral[] = [
  ...MINOR_VOCAB,
  "bVI", "bVII", "i7", "iv7",
];

export function getDefaultVocabulary(mode: Mode): RomanNumeral[] {
  return mode === "major" ? [...MAJOR_VOCAB] : [...MINOR_VOCAB];
}

export function getExtendedVocabulary(mode: Mode): RomanNumeral[] {
  return mode === "major" ? [...EXTENDED_MAJOR_VOCAB] : [...EXTENDED_MINOR_VOCAB];
}
