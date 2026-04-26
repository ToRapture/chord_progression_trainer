import type { FunctionGroup, Mode, RomanNumeral } from "./types";

const MAJOR_GROUPS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["I", "iii", "vi", "Imaj7", "iii7", "vi7"],
  PD: ["ii", "IV", "ii7", "IVmaj7"],
  D: ["V", "V7", "vii°", "viiø7", "VI7"],
  OTHER: [],
};

const MINOR_GROUPS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["i", "III", "VI", "i7"],
  PD: ["ii°", "iv", "iv7", "bVI"],
  D: ["v", "V", "V7", "VII", "vii°", "bVII"],
  OTHER: [],
};

export function getFunctionGroup(roman: RomanNumeral, mode: Mode): FunctionGroup {
  const groups = mode === "major" ? MAJOR_GROUPS : MINOR_GROUPS;
  for (const g of ["T", "PD", "D"] as const) {
    if (groups[g].includes(roman)) return g;
  }
  return "OTHER";
}

export function getFunctionGroupsForProgression(
  progression: RomanNumeral[],
  mode: Mode,
): FunctionGroup[] {
  return progression.map((r) => getFunctionGroup(r, mode));
}
