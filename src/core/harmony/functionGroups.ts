import type { FunctionGroup, Mode, RomanNumeral } from "./types";

const MAJOR_FUNCTIONS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["I", "iii", "vi", "Imaj7", "iii7", "vi7"],
  PD: ["ii", "ii7", "IV", "IVmaj7"],
  D: ["V", "V7", "vii°", "viiø7"],
  OTHER: ["bVII", "bVI", "VI7", "III7"],
};

const MINOR_FUNCTIONS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["i", "III", "VI", "i7", "III7", "VImaj7"],
  PD: ["ii°", "iv", "iiø7", "iv7", "VI"],
  D: ["v", "V", "V7", "VII", "vii°", "bVII"],
  OTHER: ["bVI", "III7", "VI7"],
};

export function getFunctionGroup(roman: RomanNumeral, mode: Mode): FunctionGroup {
  const table = mode === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;
  for (const [group, romans] of Object.entries(table) as [FunctionGroup, RomanNumeral[]][]) {
    if (romans.includes(roman)) return group;
  }
  return "OTHER";
}

export function functionSequence(romans: RomanNumeral[], mode: Mode): FunctionGroup[] {
  return romans.map((roman) => getFunctionGroup(roman, mode));
}
