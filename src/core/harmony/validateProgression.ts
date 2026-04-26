import type { ExerciseGenerationOptions } from "../exercises/types";
import type { ProgressionTemplate } from "../progressions/types";
import { parseRoman } from "./roman";
import type { RomanNumeral, ValidationResult } from "./types";

function result(errors: string[], warnings: string[] = []): ValidationResult {
  return { valid: errors.length === 0, errors, warnings };
}

export function validateRomanList(romans: RomanNumeral[]): ValidationResult {
  const errors: string[] = [];
  if (!romans.length) errors.push("roman progression must not be empty");
  romans.forEach((roman, index) => {
    if (!parseRoman(roman)) errors.push(`roman at index ${index} is not parseable: ${roman}`);
  });
  return result(errors);
}

export function validateProgressionTemplate(template: ProgressionTemplate): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!template.id) errors.push("template id is required");
  if (!template.roman.length) errors.push(`${template.id}: roman progression is empty`);
  if (template.functions.length !== template.roman.length) errors.push(`${template.id}: functions length must match roman length`);
  if (template.difficulty < 1 || template.difficulty > 5) errors.push(`${template.id}: difficulty must be 1-5`);
  if (!template.tags.length) errors.push(`${template.id}: tags must not be empty`);
  template.roman.forEach((roman) => {
    if (!parseRoman(roman)) errors.push(`${template.id}: invalid roman ${roman}`);
  });
  if (template.tags.some((tag) => ["jazz", "borrowed", "secondary"].includes(tag)) && template.difficulty <= 2) {
    warnings.push(`${template.id}: advanced tag appears in a low difficulty template`);
  }
  return result(errors, warnings);
}

export function validateProgressionAgainstOptions(progression: RomanNumeral[], options: ExerciseGenerationOptions): ValidationResult {
  const base = validateRomanList(progression);
  const errors = [...base.errors];
  progression.forEach((roman) => {
    if (!options.allowedRomans.includes(roman)) errors.push(`${roman} is not allowed by current vocabulary`);
  });
  return result(errors, base.warnings);
}
