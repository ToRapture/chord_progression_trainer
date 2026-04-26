import { jazzBasicProgressions } from "./jazzBasic";
import { majorBasicProgressions } from "./majorBasic";
import { minorBasicProgressions } from "./minorBasic";
import { popProgressions } from "./pop";
import type { ProgressionGroupId, ProgressionTemplate } from "./types";

export const progressionGroups: Record<Exclude<ProgressionGroupId, "all">, ProgressionTemplate[]> = {
  majorBasic: majorBasicProgressions,
  minorBasic: minorBasicProgressions,
  pop: popProgressions,
  jazzBasic: jazzBasicProgressions,
};

export const progressionLibrary: ProgressionTemplate[] = [
  ...majorBasicProgressions,
  ...minorBasicProgressions,
  ...popProgressions,
  ...jazzBasicProgressions,
];

export function getProgressionsByGroup(group: ProgressionGroupId): ProgressionTemplate[] {
  return group === "all" ? progressionLibrary : progressionGroups[group];
}
