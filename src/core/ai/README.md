# AI Generation (Stub)

This directory is **reserved for future LLM-powered progression generation**. The current build does not call any external API.

## Intended flow

```
User request
  → AI provider (e.g. DeepSeek / OpenAI / Anthropic)
  → JSON candidate (Omit<ProgressionTemplate, "id">[])
  → validateProgressionTemplate(candidate)   // src/core/harmony/validateProgression.ts
  → normalize + dedupe against existing library
  → only THEN save into a progression group or use as a one-off exercise
```

## Hard rule

LLM output must **never** flow directly into the progression library or the exercise generator. Always pass through `validateProgressionTemplate` first. If validation fails, drop the candidate or return it to the LLM for repair.

## Adding a real provider

1. Implement `ProgressionAIProvider` in a new file (e.g. `deepseekProvider.ts`).
2. Inject it where exercises are generated (e.g. behind a feature flag in `App.tsx`).
3. Always wrap the result with the validator from `src/core/harmony/validateProgression.ts`.
4. Add unit tests that feed known-bad LLM outputs to confirm the validator rejects them.

The stub in `localProvider.ts` exists so type-checks pass and so future agents have a clear extension point.
