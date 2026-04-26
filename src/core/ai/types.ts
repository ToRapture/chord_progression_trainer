import type { ProgressionTemplate } from "../progressions/types";

export type AIGenerationRequest = {
  mode: "major" | "minor";
  difficulty: 1 | 2 | 3 | 4 | 5;
  count: number;
  promptHint?: string;
};

export type AIGenerationResult = {
  candidates: Omit<ProgressionTemplate, "id">[];
};

export interface ProgressionAIProvider {
  generate(req: AIGenerationRequest): Promise<AIGenerationResult>;
}
