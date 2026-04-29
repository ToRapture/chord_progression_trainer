import { MusicalKey, Mode } from "./types";

const MAJOR_TONICS = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db", "Gb"] as const;
const RELATIVE_MINOR_TONICS = ["A", "E", "B", "F#", "C#", "G#", "D#", "D", "G", "C", "F", "Bb", "Eb"] as const;

export const SUPPORTED_KEYS: MusicalKey[] = [
  ...MAJOR_TONICS.map((tonic) => ({ tonic, mode: "major" as const })),
  ...RELATIVE_MINOR_TONICS.map((tonic) => ({ tonic, mode: "minor" as const })),
];

export function keyLabel(key: MusicalKey): string {
  return key.tonic;
}

export function keyId(key: MusicalKey): string {
  return `${key.tonic}_${key.mode}`;
}

export function parseKeyId(id: string): MusicalKey | null {
  const parts = id.split("_");
  if (parts.length !== 2) return null;
  const [tonic, mode] = parts as [string, string];
  if (mode !== "major" && mode !== "minor") return null;
  return { tonic, mode: mode as Mode };
}
