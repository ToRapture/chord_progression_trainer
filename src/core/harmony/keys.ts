import { MusicalKey, Mode } from "./types";

const CHROMATIC_TONICS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const SUPPORTED_KEYS: MusicalKey[] = [
  ...CHROMATIC_TONICS.map((tonic) => ({ tonic, mode: "major" as const })),
  ...CHROMATIC_TONICS.map((tonic) => ({ tonic, mode: "minor" as const })),
];

export function keyLabel(key: MusicalKey): string {
  const modeLabel = key.mode === "major" ? "major" : "minor";
  return `${key.tonic} ${modeLabel}`;
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
