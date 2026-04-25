import { MusicalKey, Mode, RomanNumeralSymbol, Difficulty } from "../harmony/types";
import { ProgressionTemplate } from "../progressions/types";

export interface ProgressionGenerationRequest {
  key: MusicalKey;
  mode: Mode;
  allowedChords: RomanNumeralSymbol[];
  lengthRange: [number, number];
  difficulty: Difficulty;
  count: number;
  tags?: string[];
}

export interface ProgressionProvider {
  generateProgressions(
    request: ProgressionGenerationRequest
  ): Promise<ProgressionTemplate[]>;
}

export interface AIValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized?: ProgressionTemplate;
}
