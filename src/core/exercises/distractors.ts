import type { Mode, RomanNumeral } from "../harmony/types";
import { getFunctionGroup } from "../harmony/functionGroups";

export const CONFUSABLE_PAIRS: [RomanNumeral, RomanNumeral][] = [
  ["IV", "ii"],
  ["vi", "iii"],
  ["V", "vii°"],
  ["I", "vi"],
  ["V", "V7"],
  ["iv", "ii°"],
  ["VI", "iv"],
];

export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickConfusableDistractors(
  target: RomanNumeral,
  mode: Mode,
  allowed: RomanNumeral[],
  count: number,
): RomanNumeral[] {
  const pool = new Set<RomanNumeral>();
  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (a === target && allowed.includes(b)) pool.add(b);
    if (b === target && allowed.includes(a)) pool.add(a);
  }
  const targetGroup = getFunctionGroup(target, mode);
  for (const r of allowed) {
    if (r === target) continue;
    if (getFunctionGroup(r, mode) === targetGroup) pool.add(r);
  }
  for (const r of allowed) {
    if (r !== target) pool.add(r);
    if (pool.size >= count + 5) break;
  }
  pool.delete(target);
  const arr = [...pool];
  return shuffleInPlace(arr).slice(0, count);
}
