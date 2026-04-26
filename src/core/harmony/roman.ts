import type { RomanNumeral } from "./types";

export type ChordQuality = "major" | "minor" | "diminished" | "halfDim" | "augmented";
export type SeventhType = "none" | "dom7" | "maj7" | "min7" | "halfDim7" | "dim7";

export type ParsedRoman = {
  degree: number;
  flat: boolean;
  quality: ChordQuality;
  seventh: SeventhType;
  raw: RomanNumeral;
};

const ROMAN_DEGREES: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};

export function parseRoman(roman: RomanNumeral): ParsedRoman {
  let s = roman.trim();
  const flat = s.startsWith("b");
  if (flat) s = s.slice(1);

  let seventh: SeventhType = "none";
  if (s.endsWith("maj7")) {
    seventh = "maj7";
    s = s.slice(0, -4);
  } else if (s.endsWith("ø7")) {
    seventh = "halfDim7";
    s = s.slice(0, -2);
  } else if (s.endsWith("°7")) {
    seventh = "dim7";
    s = s.slice(0, -2);
  } else if (s.endsWith("7")) {
    seventh = "dom7";
    s = s.slice(0, -1);
  }

  let dim = false;
  let halfDim = false;
  if (s.endsWith("ø")) {
    halfDim = true;
    s = s.slice(0, -1);
  } else if (s.endsWith("°")) {
    dim = true;
    s = s.slice(0, -1);
  }

  const lower = s.toLowerCase();
  const degree = ROMAN_DEGREES[lower];
  if (!degree) throw new Error(`Unknown Roman numeral: ${roman}`);

  const upper = s === s.toUpperCase();

  let quality: ChordQuality;
  if (dim) quality = "diminished";
  else if (halfDim) quality = "halfDim";
  else if (upper) quality = "major";
  else quality = "minor";

  if (seventh === "dom7" && quality === "minor") seventh = "min7";
  if (seventh === "halfDim7") quality = "halfDim";
  if (seventh === "dim7") quality = "diminished";

  return { degree, flat, quality, seventh, raw: roman };
}

export function isUpperCase(roman: RomanNumeral): boolean {
  const stripped = roman.replace(/^b/, "").replace(/(maj7|ø7|°7|7|ø|°)$/g, "");
  return stripped === stripped.toUpperCase();
}
