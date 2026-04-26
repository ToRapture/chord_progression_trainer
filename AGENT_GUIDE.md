# Agent Guide

## Architecture

The core data flow is:

```text
ProgressionTemplate
-> Exercise
-> VoicedChord
-> InstrumentEvent
-> playback engine
```

Keep these boundaries intact:

- Harmony and progression code must not depend on React or playback.
- UI must not construct MIDI notes directly.
- Playback must not know Roman numeral theory.
- AI output must go through local validation before being used.

## Add A Progression

Add a `ProgressionTemplate` to one of:

- `src/core/progressions/majorBasic.ts`
- `src/core/progressions/minorBasic.ts`
- `src/core/progressions/pop.ts`
- `src/core/progressions/jazzBasic.ts`

Provide id, name, mode, roman, functions, difficulty, tags, description, and cadence.

## Add An Instrument Preset

Add the preset id to `src/core/voicing/types.ts`, add the policy in `src/core/voicing/presets.ts`, and expose the label in `src/core/instruments/index.ts`.

## Add An Exercise Type

Extend `ExerciseType` in `src/core/exercises/types.ts`, implement generation in `generateExercise.ts`, and add UI copy in `App.tsx`.

## Add AI Generation

Implement a provider under `src/core/ai/`. The flow must be:

```text
prompt -> LLM JSON -> parse -> validate -> normalize -> deduplicate -> use
```

Never persist or play raw LLM output.

## Commands

```bash
npm run test
npm run lint
npm run build
```

## Common Pitfalls

- Minor `V` and `V7` are treated as harmonic-minor dominants.
- `bVII` and jazz/borrowed harmony can fall outside the beginner vocabulary.
- Tone.js playback requires a user gesture before audio can start.
- MIDI scheduling needs `stop()` to send All Notes Off and clear pending output where supported.
