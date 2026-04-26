import type { ProgressionTemplate } from "./types";
import { majorBasic } from "./majorBasic";
import { minorBasic } from "./minorBasic";
import { pop } from "./pop";
import { jazzBasic } from "./jazzBasic";

export const PROGRESSION_GROUPS = {
  majorBasic,
  minorBasic,
  pop,
  jazzBasic,
} as const;

export type ProgressionGroupId = keyof typeof PROGRESSION_GROUPS | "all";

export function getAllProgressions(): ProgressionTemplate[] {
  return [...majorBasic, ...minorBasic, ...pop, ...jazzBasic];
}

export function getProgressionsByGroup(
  group: ProgressionGroupId,
): ProgressionTemplate[] {
  if (group === "all") return getAllProgressions();
  return [...PROGRESSION_GROUPS[group]];
}

export type { ProgressionTemplate } from "./types";
