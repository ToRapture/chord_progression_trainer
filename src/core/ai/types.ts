import type { Mode, RomanNumeral } from "../harmony/types";
import type { ProgressionTemplate } from "../progressions/types";

export type AIProgressionCandidate = {
  name: string;
  mode: Mode | "both";
  roman: RomanNumeral[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  description: string;
};

export type ProgressionAIGenerator = {
  generate: (prompt: string) => Promise<AIProgressionCandidate[]>;
  validateAndNormalize: (candidate: AIProgressionCandidate) => ProgressionTemplate;
};
