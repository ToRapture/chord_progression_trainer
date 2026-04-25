import {
  MusicalKey,
  RomanNumeralSymbol,
  ChordSymbol,
  HarmonicFunction,
} from "../harmony/types";
import { ProgressionTemplate } from "../progressions/types";

export type ExerciseType =
  | "identify_progression"
  | "fill_missing_chord"
  | "detect_replacement";

export interface ExerciseChoice {
  id: string;
  label: string;
  roman?: RomanNumeralSymbol[];
  functions?: HarmonicFunction[];
  bassDegrees?: number[];
  isCorrect: boolean;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  key: MusicalKey;
  sourceProgression: ProgressionTemplate;
  renderedChords: ChordSymbol[];
  prompt: string;
  promptProgression?: (RomanNumeralSymbol | null)[];
  targetIndex?: number;
  choices: ExerciseChoice[];
  answerChoiceId: string;
  explanation: string;
}

export interface ExerciseGenerationOptions {
  key: MusicalKey;
  allowedRomans: RomanNumeralSymbol[];
  exerciseType: ExerciseType;
  difficultyRange: [number, number];
  tags?: string[];
  choiceCount: number;
  progressionGroup?: string;
}
