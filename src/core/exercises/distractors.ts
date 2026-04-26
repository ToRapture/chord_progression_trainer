import type { RomanNumeral } from "../harmony/types";
import type { ProgressionTemplate } from "../progressions/types";

export const COMMON_CONFUSIONS: [RomanNumeral, RomanNumeral][] = [
  ["IV", "ii"],
  ["vi", "iii"],
  ["V", "vii°"],
  ["I", "vi"],
  ["V", "V7"],
  ["iv", "ii°"],
  ["VI", "iv"],
];

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function choiceId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

export function progressionDistance(a: RomanNumeral[], b: RomanNumeral[]): number {
  const lengthPenalty = Math.abs(a.length - b.length) * 2;
  const pairLength = Math.min(a.length, b.length);
  let diff = lengthPenalty;
  for (let i = 0; i < pairLength; i += 1) {
    if (a[i] !== b[i]) diff += 1;
  }
  return diff;
}

export function nearestProgressionDistractors(answer: ProgressionTemplate, candidates: ProgressionTemplate[], count: number): ProgressionTemplate[] {
  return candidates
    .filter((candidate) => candidate.id !== answer.id)
    .map((candidate) => ({ candidate, distance: progressionDistance(answer.roman, candidate.roman) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ candidate }) => candidate);
}

export function singleChordDistractors(correct: RomanNumeral, allowedRomans: RomanNumeral[], count: number): RomanNumeral[] {
  const paired = COMMON_CONFUSIONS.flatMap(([a, b]) => (a === correct ? [b] : b === correct ? [a] : []));
  const pool = [...paired, ...allowedRomans].filter((roman, index, arr) => roman !== correct && arr.indexOf(roman) === index);
  return pool.slice(0, count);
}
