# Future Agent Guide

This document is for future AI agents (new sessions) that need to understand and extend this project.

## First Steps

**Read these in order before making any changes:**

1. `docs/ARCHITECTURE.md` — Understand the layered architecture
2. `docs/PROJECT_MAP.md` — Navigate the file structure
3. This file — Extension guide

## Core Design Rules (DO NOT BREAK)

1. **Never mix Roman numerals with audio playback** — The harmony layer and playback layer are completely independent.
2. **ProgressionTemplate is abstract** — It represents harmonic structure, not specific pitches.
3. **VoicedChord is concrete** — It represents specific MIDI notes for a chord.
4. **InstrumentEvent is for playback only** — It has no knowledge of music theory.
5. **UI calls actions, not music theory** — All music logic lives in `src/core/`.
6. **AI output MUST be validated** — Never use LLM output directly without `validateProgressionTemplate()`.

## How to Add Features

### Add a New Key/Tonality

1. Open `src/core/harmony/keys.ts`
2. Add entry to `SUPPORTED_KEYS` array:
   ```ts
   { tonic: "Bb", mode: "major" }
   ```
3. That's it — all progression templates and exercises will automatically work with the new key.

### Add a New Chord Progression

1. Choose the appropriate library file:
   - `src/core/progressions/majorBasic.ts`
   - `src/core/progressions/minorBasic.ts`
   - `src/core/progressions/pop.ts`
   - `src/core/progressions/jazzBasic.ts`

2. Add a new entry:
   ```ts
   {
     id: "unique_id_here",
     title: "Descriptive Title",
     mode: "major", // or "minor"
     difficulty: 2, // 1-5
     roman: ["I", "IV", "V", "I"],
     functions: ["T", "PD", "D", "T"], // must match roman length
     tags: ["basic", "cadence"],
     description: "What this progression sounds like.",
   }
   ```

3. Functions reference:
   - `T` (Tonic): I, iii, vi (major) / i, III, VI (minor)
   - `PD` (Predominant): ii, IV (major) / ii°, iv (minor)
   - `D` (Dominant): V, V7, vii° (major) / V, V7, VII, vii° (minor)

4. Run `npm test` to verify the new progression passes validation.

5. Remember: roman numerals determine the abstract harmony. The same roman numerals will render to different chord symbols in different keys.

### Add a New Exercise Type

1. `src/core/exercises/types.ts` — Add to `ExerciseType`:
   ```ts
   export type ExerciseType =
     | "identify_progression"
     | "fill_missing_chord"
     | "detect_replacement"
     | "your_new_type";
   ```

2. `src/core/exercises/generateExercise.ts` — Add generator function:
   ```ts
   function generateYourNewExercise(options: ExerciseGenerationOptions): Exercise {
     // ... implementation
   }
   ```
   Then add a case in `generateExercise()`.

3. `src/core/exercises/distractors.ts` — Add distractor generation if needed.

4. `src/app/App.tsx` — Add UI handling for the new type in TrainerPage.

### Add a New Instrument (e.g., Flute, Organ)

1. `src/core/instruments/types.ts` — Add to `InstrumentPresetId`:
   ```ts
   | "flute_basic"
   ```

2. `src/core/instruments/flute.ts` — Create instrument config:
   ```ts
   export interface FluteConfig { ... }
   export function getFluteConfig(presetId: string): FluteConfig { ... }
   ```

3. `src/core/instruments/index.ts` — Export the new module.

4. `src/core/voicing/presets.ts` — Add voicing policy for the new instrument:
   ```ts
   export const FLUTE_BASIC: VoicingPolicy = { ... }
   ```
   Add it to `getPreset()` and `getAllPresets()`.

5. `src/core/playback/toneEngine.ts` — Optionally create instrument-specific synth settings.

6. `src/app/App.tsx` — Add to the instrument selector dropdown.

### Add Guitar Shapes

1. `src/core/instruments/guitar.ts` — Add to `GUITAR_OPEN_SHAPES`:
   ```ts
   Bb: [46, 50, 53, 58, 62], // x13331
   ```

2. MIDI note numbers:
   - C2=36, C3=48, C4=60, C5=72
   - Half step = +1

### Add String Quartet Support

1. `src/core/instruments/strings.ts` — Enhance `voiceStringQuartet()` for better voice distribution.

2. `src/core/voicing/presets.ts` — The `STRINGS_QUARTET_BASIC` preset already exists.

### Add AI Progression Generation (DeepSeek / OpenAI / Local LLM)

1. Read `src/core/ai/README.md` first.

2. Create `src/core/ai/deepseekProvider.ts`:
   ```ts
   import { ProgressionProvider, ProgressionGenerationRequest } from "./types";
   import { ProgressionTemplate } from "../progressions/types";
   import { validateProgressionTemplate } from "../harmony/validateProgression";

   export const deepseekProvider: ProgressionProvider = {
     async generateProgressions(request: ProgressionGenerationRequest): Promise<ProgressionTemplate[]> {
       // 1. Build prompt describing desired progression
       // 2. Call DeepSeek API
       // 3. Parse JSON response
       // 4. Validate each candidate with validateProgressionTemplate()
       // 5. Return valid candidates
     }
   };
   ```

3. **CRITICAL**: LLM output must ALWAYS be validated:
   ```ts
   const result = validateProgressionTemplate(candidate);
   if (!result.valid) {
     // reject or fix
   }
   ```

4. Required validation checks:
   - Non-empty roman array
   - Each roman is parseable
   - Functions length matches roman length
   - Difficulty in 1-5
   - Tags non-empty
   - All chords are diatonic (or properly sourced)

### Add a New Voicing Policy

1. `src/core/voicing/presets.ts` — Add new preset:
   ```ts
   export const MY_NEW_PRESET: VoicingPolicy = {
     id: "my_preset",
     name: "My Preset",
     bassRange: [36, 48],         // MIDI range for bass
     upperRange: [60, 79],         // MIDI range for upper voices
     upperVoiceCount: 3,           // Number of upper voices
     preferRootBass: true,         // Prefer root in bass
     allowInversions: false,       // Allow inverted chords
     allowOmitFifth: false,        // Allow omitting the fifth
     allowExtensions: false,       // Allow extended chords (9, 11, 13)
     smoothVoiceLeading: true,     // Prefer smooth voice leading
     maxUpperVoiceLeap: 5,         // Max semitones between chord changes
   };
   ```

2. Add it to `getPreset()`.

### Add a New Playback Pattern

1. `src/core/playback/scheduler.ts` — Add pattern function like `scheduleArpeggio()` or `scheduleStrum()`.

## Common Pitfalls

1. **Don't convert roman numerals to pitches in UI** — Use the existing pipeline.
2. **Don't reference DOM/Tone.js in core/ modules** — Core modules must be testable without a browser.
3. **Don't mutate progression templates** — Treat them as immutable data.
4. **Always write tests** — Run `npm test` before committing.
5. **Don't import UI code in core/** — Dependency direction is one-way: UI → core.
6. **PitchClass vs MidiNote** — PitchClass is class (C, C#, D...), MidiNote is specific octave (C4=60).

## Test Commands

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm run build           # Production build check
npm run dev             # Development server
```

## Tone.js Notes

- `Tone.start()` MUST be called after a user gesture (click). The `initAudio()` function handles this.
- `Tone.PolySynth` is currently used for all instruments; it can be replaced with `Tone.Sampler` for real samples.
- The Transport is used for scheduling; events have `time` in seconds from start.

## Tonal.js Notes

- `Tonal.RomanNumeral.get("I", "C")` returns the roman numeral analysis for I in C major
- `Tonal.Chord.get("Cmaj7")` returns chord intervals and notes
- `Tonal.Note.midi("C4")` → 60, `Tonal.Note.fromMidi(60)` → "C4"
- Tonal handles enharmonic spelling automatically
