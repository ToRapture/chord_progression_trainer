import type { KeySignature, Mode, RomanNumeral } from "./types";

export const CHROMATIC_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const DEFAULT_MAJOR_VOCABULARY: RomanNumeral[] = ["I", "ii", "iii", "IV", "V", "V7", "vi", "vii°"];
export const DEFAULT_MINOR_VOCABULARY: RomanNumeral[] = ["i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°", "bVII", "bVI"];

export function getSupportedKeys(mode: Mode): KeySignature[] {
  return CHROMATIC_KEYS.map((tonic) => ({ tonic, mode }));
}

export function defaultVocabularyForMode(mode: Mode): RomanNumeral[] {
  return mode === "major" ? DEFAULT_MAJOR_VOCABULARY : DEFAULT_MINOR_VOCABULARY;
}

export function keyLabel(key: KeySignature): string {
  return `${key.tonic} ${key.mode}`;
}
