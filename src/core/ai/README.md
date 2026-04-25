# AI Provider Interface

## Status

Currently, no real AI API is connected. The `localProvider` selects progressions from the built-in library based on filter criteria.

## Architecture

```text
User request
  → AI generator (ProgressionProvider interface)
  → JSON candidate (ProgressionTemplate)
  → Local validator
  → Progression library / temporary exercise
```

## Future Integration

To connect a real LLM (DeepSeek, OpenAI, local model):

1. Implement `ProgressionProvider` in a new file (e.g., `deepseekProvider.ts`)
2. Send a prompt describing the desired progression characteristics
3. Parse the LLM JSON response into `ProgressionTemplate`
4. Validate using `validateProgressionTemplate` from `src/core/harmony/validateProgression.ts`
5. De-duplicate against existing library
6. Only then use as exercise source

## Important Rules

- LLM output MUST be validated before entering the exercise pool
- LLM output MUST NOT be saved to the progression library without validation
- Keep the `ProgressionProvider` interface stable so providers are swappable

## Interface

```ts
interface ProgressionProvider {
  generateProgressions(
    request: ProgressionGenerationRequest
  ): Promise<ProgressionTemplate[]>
}
```
