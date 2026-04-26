# ARCHITECTURE

## Layers

```
┌────────────────────────────────────────────────┐
│  ui  (src/app/*)                               │
│  React, useState, no music-theory knowledge    │
└──────┬─────────────────────────────────────────┘
       │ calls voiceProgression, scheduleEvents,
       │ playEvents, generateExercise, scoreAnswer
       ▼
┌────────────────────────────────────────────────┐
│  playback  (src/core/playback/*)               │
│  scheduler  →  toneEngine  +  midiEngine       │
└──────┬─────────────────────────────────────────┘
       │ takes VoicedChord[], emits InstrumentEvent[]
       ▼
┌────────────────────────────────────────────────┐
│  voicing  (src/core/voicing/*)                 │
│  generateCandidates → score → chooseBest       │
└──────┬─────────────────────────────────────────┘
       │ uses ChordSymbol resolved by ↓
       ▼
┌────────────────────────────────────────────────┐
│  harmony  (src/core/harmony/*)                 │
│  Roman → ChordSymbol, function groups          │
└────────────────────────────────────────────────┘

  Independent siblings:
   - progressions (data) — read by exercises and UI
   - exercises (composes progressions + harmony)
   - instruments (descriptors used by playback)
   - ai (interface only; stub provider)
```

A module imports only from layers strictly below it. Concretely:

- `harmony/*` imports only `@tonaljs/tonal`.
- `voicing/*` imports `harmony/*`.
- `playback/*` imports `voicing/*` (for the `InstrumentEvent` type) and external libs (`tone`, Web MIDI).
- `exercises/*` imports `harmony/*` and `progressions/*`.
- `ui/*` imports anything from `core/*`.

Nothing under `core/` imports from `app/` or touches `document` / `localStorage`.

## Dataflow: one exercise round

```
TrainerPage state
   │
   ▼
generateExercise(opts)                  ← src/core/exercises/generateExercise.ts
   ├─ pickTemplate (filter by mode/group/difficulty/allowedRomans)
   ├─ romanProgressionToChordSymbols    ← src/core/harmony/chordSymbols.ts
   └─ pickConfusableDistractors         ← src/core/exercises/distractors.ts
   │
   ▼  Exercise { originalProgression, choices, answerId, ... }

User clicks Play:
voiceProgression({ key, progression, instrumentPreset })   ← src/core/voicing/index.ts
   │   for each Roman:
   │     romanToChordSymbol → generateCandidates
   │     chooseBestVoicing(prev, candidates, policy)
   ▼  VoicedChord[] { bass, upperVoices, allNotes }

scheduleEvents(voiced, { tempoBpm })    ← src/core/playback/scheduler.ts
   ▼  InstrumentEvent[] { time, duration, notes, velocity }

toneEngine.playEvents(events) | midiEngine.playEvents(events)

User clicks a choice:
scoreAnswer(exercise, choiceId)         ← src/core/exercises/scoring.ts
   ▼  { correct, explanation }

UI sets reveal=true, shows feedback.
```

## Why this shape

- The harmony layer is the only place that knows how Roman numerals map to chord symbols, and the only place that knows about harmonic-minor exceptions. Adding modal interchange or secondary dominants means changing one file (`chordSymbols.ts`).
- The voicing layer is generative + scoring, not rule-driven. Adding a new style (e.g. drop-2 jazz voicings) means writing more candidate generators and/or adjusting the score function — no UI change.
- Playback is split: `scheduler.ts` is pure (chords → events, no IO), `toneEngine.ts` and `midiEngine.ts` are the only IO. This keeps tests deterministic — none of the unit tests start an audio context.
- Exercises are pure data factories. The UI owns `useState`, never the exercise module.

## State

The UI has zero global state. Each page is a component with its own `useState`. Two singletons live in `core/playback/{toneEngine,midiEngine}.ts` (the `Tone.Sampler` and the `MIDIAccess`); they're module-local, lazy, and stoppable from anywhere.

## Stop semantics

- `toneEngine.stop()` disposes the sampler entirely (Tone.Sampler can't reliably cancel future-scheduled `triggerAttackRelease`s; `releaseAll` doesn't unschedule). The next `playEvents` rebuilds the sampler.
- `midiEngine.stop()` sends an "All Notes Off" CC (123) on all 16 channels and calls `clear()` on the output if available.

This is why "Stop" is reliable on both engines even mid-progression.

## Test surface

`src/tests/*` covers `core/*`. The UI is not unit-tested. The Debug page is the manual surface — type any Roman input and inspect the exact MIDI numbers the voicing engine produces.
