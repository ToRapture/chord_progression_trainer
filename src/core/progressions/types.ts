import { Difficulty, HarmonicFunction, Mode, RomanNumeralSymbol } from "../harmony/types";

export interface ProgressionTemplate {
  id: string;
  title: string;
  mode: Mode;
  difficulty: Difficulty;
  roman: RomanNumeralSymbol[];
  functions: HarmonicFunction[];
  tags: string[];
  description?: string;
}
