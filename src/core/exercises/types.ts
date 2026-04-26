import type {
  ChordSymbol,
  FunctionGroup,
  KeySignature,
  RomanNumeral,
} from "../harmony/types";
import type { InstrumentPresetId } from "../voicing/types";

export type ExerciseType =
  | "identify_progression"
  | "fill_missing_chord"
  | "detect_replacement"
  | "identify_function"
  | "identify_bass_degrees";

export type ExerciseChoice = {
  id: string;
  label: string;
  roman?: RomanNumeral[];
  functions?: FunctionGroup[];
  bassDegrees?: number[];
  isCorrect: boolean;
};

export type Exercise = {
  id: string;
  type: ExerciseType;
  key: KeySignature;
  originalProgression: RomanNumeral[];
  renderedChords: ChordSymbol[];
  promptProgression?: (RomanNumeral | null)[];
  targetIndex?: number;
  choices: ExerciseChoice[];
  answerId: string;
  explanation: string;
  metadata: {
    difficulty: number;
    tags: string[];
    instrumentPreset: InstrumentPresetId;
  };
};

export type ExerciseGenerationOptions = {
  key: KeySignature;
  allowedRomans: RomanNumeral[];
  exerciseType: ExerciseType;
  difficultyRange: [number, number];
  tags?: string[];
  groupId?: string;
  instrumentPreset: InstrumentPresetId;
  choiceCount: number;
};
