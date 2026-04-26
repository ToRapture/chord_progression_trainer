import type { Mode, RomanNumeral } from "./types";
import type { ProgressionTemplate } from "../progressions/types";
import { parseRoman } from "./roman";

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validateProgressionTemplate(t: ProgressionTemplate): ValidationResult {
  const errors: string[] = [];
  if (!t.id) errors.push("Missing id");
  if (!t.name) errors.push("Missing name");
  if (!t.roman || t.roman.length === 0) errors.push("Empty roman");
  if (!t.functions || t.functions.length !== (t.roman?.length ?? 0)) {
    errors.push("functions length must equal roman length");
  }
  if (!t.tags || t.tags.length === 0) errors.push("tags must be non-empty");
  if (t.difficulty < 1 || t.difficulty > 5) errors.push("difficulty out of range");

  for (const r of t.roman ?? []) {
    try {
      parseRoman(r);
    } catch {
      errors.push(`Unparseable roman: ${r}`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export type ValidateAgainstOptions = {
  allowedRomans: RomanNumeral[];
  mode: Mode;
};

export function validateProgressionAgainstOptions(
  progression: RomanNumeral[],
  opts: ValidateAgainstOptions,
): ValidationResult {
  const errors: string[] = [];
  for (const r of progression) {
    if (!opts.allowedRomans.includes(r)) {
      errors.push(`Roman not allowed for ${opts.mode}: ${r}`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
