import { ProgressionTemplate } from "./types";
import { majorBasic } from "./majorBasic";
import { minorBasic } from "./minorBasic";
import { pop } from "./pop";
import { jazzBasic } from "./jazzBasic";
import { Mode, RomanNumeralSymbol } from "../harmony/types";

export type { ProgressionTemplate } from "./types";

const allProgressions: ProgressionTemplate[] = [
  ...majorBasic,
  ...minorBasic,
  ...pop,
  ...jazzBasic,
];

export function getAllProgressions(): ProgressionTemplate[] {
  return allProgressions;
}

export function getProgressionsByMode(mode: Mode): ProgressionTemplate[] {
  return allProgressions.filter((p) => p.mode === mode);
}

export function getProgressionsByDifficulty(
  min: number,
  max: number
): ProgressionTemplate[] {
  return allProgressions.filter(
    (p) => p.difficulty >= min && p.difficulty <= max
  );
}

export function getProgressionsByTags(tags: string[]): ProgressionTemplate[] {
  if (tags.length === 0) return allProgressions;
  return allProgressions.filter((p) =>
    tags.some((t) => p.tags.includes(t))
  );
}

export function getProgressionsByAllowedRomans(
  allowedRomans: RomanNumeralSymbol[],
  mode: Mode
): ProgressionTemplate[] {
  return allProgressions.filter(
    (p) =>
      p.mode === mode &&
      p.roman.every((r) => {
        const base = r.replace(/7|maj7|m7|°|ø/g, "");
        return allowedRomans.some((a) => a.replace(/7|maj7|m7|°|ø|m/g, "") === base || a === r);
      })
  );
}

export function getProgressionsByGroup(group: string): ProgressionTemplate[] {
  const groups: Record<string, ProgressionTemplate[]> = {
    majorBasic,
    minorBasic,
    pop,
    jazzBasic,
  };
  return groups[group] ?? allProgressions;
}

export { majorBasic, minorBasic, pop, jazzBasic };

export function getProgressionById(id: string): ProgressionTemplate | undefined {
  return allProgressions.find((p) => p.id === id);
}
