import { MusicalKey, Mode } from "./types";

export const SUPPORTED_KEYS: MusicalKey[] = [
  { tonic: "C", mode: "major" },
  { tonic: "G", mode: "major" },
  { tonic: "F", mode: "major" },
  { tonic: "A", mode: "minor" },
  { tonic: "D", mode: "minor" },
  { tonic: "E", mode: "minor" },
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
