# AGENT_GUIDE

Contract for future agents (human or LLM) extending this codebase. Read this before adding modules.

## Layering rule

```
ui  →  playback  →  voicing  →  harmony  →  (no deps)
                ↘  exercises ↗
                ↘  progressions ↗
```

A module may import only from layers strictly below it. The harmony layer has no internal deps beyond `@tonaljs/tonal`. UI never reaches into `tonal` or `tone` directly — it goes through `core/playback` and `core/voicing`.

If you find yourself wanting a back-edge (e.g. a voicing module that knows about exercises), it's a smell — refactor.

## Type-first

Every public function takes a typed object and returns a typed result. No untyped `any`. Strict mode is on; `noUnusedLocals`/`noUnusedParameters` will fail your build. Lint runs as `tsc --noEmit -p tsconfig.json`.

## Adding a new progression

1. Open `src/core/progressions/{majorBasic,minorBasic,pop,jazzBasic}.ts` — pick the file that matches the genre.
2. Append a `ProgressionTemplate` (`src/core/progressions/types.ts`) with a unique `id`, Roman numerals using only tokens parseable by `parseRoman`, matching `functions[]`, difficulty 1-5, and at least one tag.
3. Run `npm run test`. The `progressionValidation.test.ts` suite parses every template and will fail loudly if anything's off.
4. Update the `Has 72 progressions` count if you add or remove entries.

## Adding a new instrument preset

1. Add the `InstrumentPresetId` literal to `src/core/voicing/types.ts`.
2. Write a `VoicingPolicy` in `src/core/voicing/presets.ts`. Bass and upper ranges are MIDI; `upperVoiceCount` is how many voices above the bass.
3. Write an `InstrumentDescriptor` in `src/core/instruments/{piano|guitar|strings}.ts` (or a new file) and register it in `src/core/instruments/index.ts`.
4. Add the new id to the `PRESETS` lists in `src/app/pages/TrainerPage.tsx` and `DebugPage.tsx`.

The Tone.js engine currently always uses the Salamander piano sampler regardless of preset (the `_preset` arg is reserved). To use real per-preset samples, route through different `Tone.Sampler` instances inside `src/core/playback/toneEngine.ts`.

## Adding a new exercise type

1. Add the literal to `ExerciseType` in `src/core/exercises/types.ts`.
2. Implement a `generateXxx(opts)` function in `src/core/exercises/generateExercise.ts` and add the case to the switch. Return `null` if the options can't yield an exercise (no template matches, etc.).
3. Add a unit test in `src/tests/exerciseGeneration.test.ts`.
4. Add the type to the `EXERCISE_TYPES` list in `src/app/pages/TrainerPage.tsx`. If it needs a custom display, fork the `ExerciseDisplay` switch.

## Plugging in an AI generator

`src/core/ai/types.ts` defines `ProgressionAIProvider`. The current `LocalAIStubProvider` throws. Replace it (or pick the active provider in a small DI module) with one that calls an LLM and returns `ProgressionTemplate`-shaped objects. Validate the LLM output through `validateProgressionTemplate` before letting it into the rest of the system — never trust freeform model output.

## Tests are the contract

`npm run test` runs four suites (110 tests total):

- `harmony.test.ts` — Roman parsing, chord-symbol resolution (incl. harmonic-minor V → major in minor mode).
- `progressionValidation.test.ts` — schema validation for every template.
- `exerciseGeneration.test.ts` — each exercise type's invariants.
- `voicing.test.ts` — voiced output has correct ranges, smooth voice leading, and contains the chord's third.

Don't ship a change that breaks any of these without updating the test (and explaining why in the commit).

## Don't

- Don't add an interactive editor / re-write the harmony layer to be config-driven before there's a second consumer needing it.
- Don't make `core/` import from `app/`.
- Don't write to `localStorage` from inside `core/` — keep persistence in the UI layer.
- Don't reach into `Tone.Transport` outside `toneEngine.ts`.
