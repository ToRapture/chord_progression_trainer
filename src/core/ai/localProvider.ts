import { functionSequence } from "../harmony/functionGroups";
import { validateProgressionTemplate } from "../harmony/validateProgression";
import type { ProgressionTemplate } from "../progressions/types";
import type { AIProgressionCandidate, ProgressionAIGenerator } from "./types";

export class LocalOnlyProgressionProvider implements ProgressionAIGenerator {
  async generate(prompt: string): Promise<AIProgressionCandidate[]> {
    void prompt;
    return [];
  }

  validateAndNormalize(candidate: AIProgressionCandidate): ProgressionTemplate {
    const modeForFunctions = candidate.mode === "minor" ? "minor" : "major";
    const template: ProgressionTemplate = {
      id: `ai-local-${candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: candidate.name,
      mode: candidate.mode,
      roman: candidate.roman,
      functions: functionSequence(candidate.roman, modeForFunctions),
      difficulty: candidate.difficulty,
      tags: candidate.tags,
      description: candidate.description,
      cadence: "none",
    };
    const validation = validateProgressionTemplate(template);
    if (!validation.valid) throw new Error(validation.errors.join("; "));
    return template;
  }
}
