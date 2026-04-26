import type {
  AIGenerationRequest,
  AIGenerationResult,
  ProgressionAIProvider,
} from "./types";

export class LocalAIStubProvider implements ProgressionAIProvider {
  async generate(_req: AIGenerationRequest): Promise<AIGenerationResult> {
    throw new Error(
      "AI generation not implemented yet — only the stub provider is available. " +
        "When wired up, route LLM JSON output through validateProgressionTemplate before saving.",
    );
  }
}
