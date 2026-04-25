import { RomanNumeralSymbol, Mode, Difficulty } from "./types";
import { isDiatonicRoman } from "./roman";
import { getFunctionGroup } from "./functionGroups";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProgressionTemplateInput {
  id: string;
  roman: RomanNumeralSymbol[];
  functions?: string[];
  mode: Mode;
  difficulty: Difficulty;
  tags: string[];
}

export function validateProgressionTemplate(
  template: ProgressionTemplateInput
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template.id || template.id.trim().length === 0) {
    errors.push("Progression must have a non-empty id");
  }

  if (!template.roman || template.roman.length === 0) {
    errors.push("Progression roman array must not be empty");
  }

  if (template.difficulty < 1 || template.difficulty > 5) {
    errors.push("Difficulty must be between 1 and 5");
  }

  if (!template.tags || template.tags.length === 0) {
    warnings.push("Progression should have at least one tag");
  }

  if (template.functions && template.functions.length !== template.roman.length) {
    errors.push(
      `Functions length (${template.functions.length}) must match roman length (${template.roman.length})`
    );
  }

  for (const r of template.roman) {
    if (!isDiatonicRoman(r, template.mode)) {
      warnings.push(`Roman numeral "${r}" is not diatonic in ${template.mode}`);
    }
  }

  if (template.functions) {
    for (let i = 0; i < template.functions.length; i++) {
      const expected = getFunctionGroup(template.roman[i], template.mode);
      if (template.functions[i] !== expected) {
        warnings.push(
          `Function group mismatch at index ${i}: expected "${expected}" but got "${template.functions[i]}" for "${template.roman[i]}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateProgressionAgainstOptions(
  progression: RomanNumeralSymbol[],
  allowedRomans: RomanNumeralSymbol[],
  mode: Mode
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (progression.length === 0) {
    errors.push("Progression cannot be empty");
  }

  for (const r of progression) {
    if (!allowedRomans.includes(r)) {
      errors.push(`Roman numeral "${r}" is not in allowed set: [${allowedRomans.join(", ")}]`);
    }
    if (!isDiatonicRoman(r, mode)) {
      warnings.push(`Roman numeral "${r}" is not diatonic in ${mode}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
