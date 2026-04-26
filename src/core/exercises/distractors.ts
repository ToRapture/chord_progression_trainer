import {
  RomanNumeralSymbol,
  HarmonicFunction,
} from "../harmony/types";
import { COMMON_CONFUSION_PAIRS, getFunctionGroup } from "../harmony/functionGroups";
import { ProgressionTemplate } from "../progressions/types";
import { getAllProgressions, getProgressionsByAllowedRomans } from "../progressions/index";
import { ExerciseChoice } from "./types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateDistractorProgressions(
  answer: ProgressionTemplate,
  count: number,
  mode: "major" | "minor",
  allowedRomans: RomanNumeralSymbol[],
  difficultyRange: [number, number]
): ProgressionTemplate[] {
  const candidates = getProgressionsByAllowedRomans(allowedRomans, mode);
  const others = candidates.filter(
    (p) =>
      p.id !== answer.id &&
      p.roman.length === answer.roman.length &&
      p.roman.join(" → ") !== answer.roman.join(" → ") &&
      p.difficulty >= difficultyRange[0] &&
      p.difficulty <= difficultyRange[1]
  );

  const preferSameLength = others.filter((p) => p.roman.length === answer.roman.length);
  const pool = preferSameLength.length >= count * 3 ? preferSameLength : others;

  return shuffleArray(pool).slice(0, count);
}

export function generateFillInDistractorChoices(
  correctRoman: RomanNumeralSymbol,
  mode: "major" | "minor",
  count: number
): RomanNumeralSymbol[] {
  const correctBase = correctRoman.replace(/7|maj7|m7|°|ø|m/g, "");
  const correctFunction = getFunctionGroup(correctRoman, mode);

  const sameFunctionRomans: RomanNumeralSymbol[] = [];
  const diatonicRomans =
    mode === "major"
      ? ["I", "ii", "iii", "IV", "V", "V7", "vi", "vii°"]
      : ["i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°"];

  for (const r of diatonicRomans) {
    const base = r.replace(/7|maj7|m7|°|ø|m/g, "");
    if (base !== correctBase) {
      const fn = getFunctionGroup(r, mode);
      if (fn === correctFunction) {
        sameFunctionRomans.push(r);
      }
    }
  }

  const confusionPairs = COMMON_CONFUSION_PAIRS.filter(([a, b]) => {
    const aBase = a.replace(/7|maj7|m7|°|ø|m/g, "");
    const bBase = b.replace(/7|maj7|m7|°|ø|m/g, "");
    return aBase === correctBase || bBase === correctBase;
  });

  const confusionRomans = confusionPairs.map(([a, b]) => {
    const aBase = a.replace(/7|maj7|m7|°|ø|m/g, "");
    return aBase === correctBase ? b : a;
  });

  const distractors = [...new Set([...sameFunctionRomans, ...confusionRomans])];

  const filtered = distractors.filter((r) => {
    const base = r.replace(/7|maj7|m7|°|ø|m/g, "");
    return base !== correctBase;
  });

  return shuffleArray(filtered).slice(0, count);
}

export function createChoiceFromRoman(
  id: string,
  roman: RomanNumeralSymbol,
  isCorrect: boolean,
  mode: "major" | "minor"
): ExerciseChoice {
  return {
    id,
    label: roman,
    roman: [roman],
    functions: [getFunctionGroup(roman, mode)],
    isCorrect,
  };
}

export function createProgressionChoice(
  id: string,
  progression: ProgressionTemplate,
  isCorrect: boolean
): ExerciseChoice {
  return {
    id,
    label: progression.roman.join(" → "),
    roman: progression.roman,
    functions: progression.functions,
    isCorrect,
  };
}
