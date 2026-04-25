import { HarmonicFunction, RomanNumeralSymbol } from "./types";

const MAJOR_FUNCTION_GROUPS: Record<string, HarmonicFunction> = {
  I: "T",
  iii: "T",
  vi: "T",
  ii: "PD",
  IV: "PD",
  V: "D",
  V7: "D",
  "vii°": "D",
};

const MINOR_FUNCTION_GROUPS: Record<string, HarmonicFunction> = {
  i: "T",
  III: "T",
  VI: "T",
  "ii°": "PD",
  iv: "PD",
  v: "D",
  V: "D",
  V7: "D",
  VII: "D",
  "vii°": "D",
};

export function getFunctionGroup(
  roman: RomanNumeralSymbol,
  mode: "major" | "minor"
): HarmonicFunction {
  const groups = mode === "major" ? MAJOR_FUNCTION_GROUPS : MINOR_FUNCTION_GROUPS;

  if (roman in groups) {
    return groups[roman]!;
  }

  const base = roman.replace(/7|maj7|m7|°|ø|m|\+|b/g, "");
  const lookup = base in groups ? groups[base] : undefined;
  if (lookup) return lookup;

  const defaultMap: Record<string, HarmonicFunction> = {
    I: "T", i: "T",
    ii: "PD", "ii°": "PD",
    iii: "T", III: "T",
    IV: "PD", iv: "PD",
    V: "D", V7: "D", v: "D",
    vi: "T", VI: "T",
    VII: "D",
  };

  return defaultMap[base] ?? "T";
}

export const MAJOR_DIATONIC_ROMANS: RomanNumeralSymbol[] = [
  "I", "ii", "iii", "IV", "V", "V7", "vi", "vii°",
];

export const MINOR_DIATONIC_ROMANS: RomanNumeralSymbol[] = [
  "i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°",
];

export const COMMON_CONFUSION_PAIRS: [RomanNumeralSymbol, RomanNumeralSymbol][] = [
  ["IV", "ii"],
  ["vi", "iii"],
  ["V", "vii°"],
  ["I", "vi"],
  ["V", "V7"],
  ["iv", "ii°"],
  ["VI", "iv"],
];
