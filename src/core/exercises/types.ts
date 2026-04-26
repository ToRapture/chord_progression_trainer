import type { FunctionGroup, KeySignature, RomanNumeral } from "../harmony/types";
import type { InstrumentPresetId } from "../voicing/types";

export type ExerciseType =
  | "identify_progression"
  | "fill_missing_chord"
  | "detect_replacement"
  | "identify_function"
  | "identify_bass_degrees";

export type Exercise = {
  id: string;
  type: ExerciseType;
  key: KeySignature;
  originalProgression: RomanNumeral[];
  renderedChords: string[];
  promptProgression?: (RomanNumeral | null)[];
  targetIndex?: number;
  playedProgression?: RomanNumeral[];
  choices: ExerciseChoice[];
  answerId: string;
  explanation: string;
  metadata: {
    difficulty: number;
    tags: string[];
    instrumentPreset: InstrumentPresetId;
  };
};

export type ExerciseChoice = {
  id: string;
  label: string;
  roman?: RomanNumeral[];
  functions?: FunctionGroup[];
  bassDegrees?: number[];
  isCorrect: boolean;
};

export type ExerciseGenerationOptions = {
  key: KeySignature;
  allowedRomans: RomanNumeral[];
  exerciseType: ExerciseType;
  difficultyRange: [number, number];
  tags?: string[];
  instrumentPreset: InstrumentPresetId;
  choiceCount: number;
  progressionGroup?: string;
};
