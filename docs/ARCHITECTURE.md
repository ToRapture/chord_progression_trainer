# Architecture

## Overview

The Chord Progression Trainer is a browser-based ear training application that helps musicians recognize chord progressions by ear. It is built with strict separation of concerns across multiple layers.

## System Layers

```
┌─────────────────────────────────────────────┐
│                  React UI                    │  src/app/
├─────────────────────────────────────────────┤
│              Playback Engine                 │  src/core/playback/
│        (Tone.js Transport + PolySynth)       │
├─────────────────────────────────────────────┤
│           Instrument Renderer                │  src/core/instruments/
│     (piano, guitar, strings configs)         │
├─────────────────────────────────────────────┤
│              Voicing Engine                  │  src/core/voicing/
│   (pitch distribution, voice leading,        │
│    candidate scoring)                        │
├─────────────────────────────────────────────┤
│           Exercise Generator                 │  src/core/exercises/
│   (exercise types, distractors, scoring)     │
├─────────────────────────────────────────────┤
│          Progression Library                 │  src/core/progressions/
│   (60+ progression templates)               │
├─────────────────────────────────────────────┤
│             Harmony Engine                   │  src/core/harmony/
│   (roman numerals, keys, chord symbols,      │
│    function groups, validation)              │
├─────────────────────────────────────────────┤
│           AI Provider (placeholder)          │  src/core/ai/
└─────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Harmony Engine (`src/core/harmony/`)

The foundation layer that provides all music theory abstractions:

- **types.ts**: Core types (`MusicalKey`, `Mode`, `RomanNumeralSymbol`, `ChordSymbol`, `HarmonicFunction`, etc.)
- **keys.ts**: Supported keys definition and helpers
- **roman.ts**: Roman numeral → chord symbol conversion using Tonal.js
- **chordSymbols.ts**: Chord symbol parsing and MIDI conversion utilities
- **functionGroups.ts**: T/PD/D function group classification for major and minor
- **validateProgression.ts**: Progression template validation rules

This layer is PURE. No audio, no UI, no exercise logic.

### 2. Progression Library (`src/core/progressions/`)

A catalog of chord progression templates organized by style:

- **majorBasic.ts**: 25 fundamental major key progressions
- **minorBasic.ts**: 18 fundamental minor key progressions
- **pop.ts**: 17 common pop/rock progressions
- **jazzBasic.ts**: 12 jazz ii-V-I and turnaround progressions
- **index.ts**: Query interface with filtering by mode, difficulty, tags, allowed chords

### 3. Exercise Generator (`src/core/exercises/`)

Generates training exercises from progression templates:

- **generateExercise.ts**: Three exercise types (identify_progression, fill_missing_chord, detect_replacement)
- **distractors.ts**: Generates plausible wrong answers using function groups and confusion pairs
- **scoring.ts**: Tracks correct/incorrect answers and computes score
- **types.ts**: Exercise, ExerciseChoice, ExerciseGenerationOptions

### 4. Voicing Engine (`src/core/voicing/`)

Converts abstract chord symbols into specific pitches (voicings):

- **pitchUtils.ts**: MIDI conversion, pitch class extraction, voice distribution
- **generateCandidates.ts**: Generates multiple voicing candidates for a chord
- **voiceLeading.ts**: Scores candidates based on smoothness, range, bass clarity
- **chooseBestVoicing.ts**: Selects the best candidate for a progression chain
- **presets.ts**: Four voicing presets (piano_clear, piano_smooth, guitar_open, strings_quartet_basic)

Scoring criteria:
1. Total upper voice movement
2. Large leap penalty (> maxUpperVoiceLeap)
3. Range violation penalty (bass too low/high, voices out of range)
4. Muddy low interval penalty (close intervals in bass register)
5. Missing third penalty (high weight - third defines chord quality)
6. Bad bass penalty (non-root bass when preferRootBass)

### 5. Instrument Renderer (`src/core/instruments/`)

Instrument-specific configurations and voicing strategies:

- **piano.ts**: Piano envelope and articulation configs
- **guitar.ts**: Guitar open chord shape dictionary with MIDI note mappings
- **strings.ts**: String quartet voice distribution (cello/viola/violin II/violin I)
- **types.ts**: `InstrumentPresetId`, `InstrumentEvent`, `Articulation`

### 6. Playback Engine (`src/core/playback/`)

Audio playback using Tone.js:

- **scheduler.ts**: Converts `VoicedChord[]` to `InstrumentEvent[]` with timing
- **toneEngine.ts**: Wraps Tone.PolySynth for play/stop/tempo control
- **types.ts**: PlaybackOptions (tempo, beatsPerChord)

Supports three articulation patterns: block, arpeggio, strum.

### 7. React UI (`src/app/`)

The presentation layer:

- **App.tsx**: Main component with tab navigation (Trainer, Library, Debug)
- **main.tsx**: React entry point
- **styles.css**: Dark theme CSS

Three views:
- **TrainerPage**: Settings panel, exercise display, answer choices, feedback
- **LibraryPage**: Browse all built-in progression templates with filtering
- **DebugPage**: Raw JSON display of exercise, voicedChords, instrumentEvents

### 8. AI Provider (`src/core/ai/`)

Placeholder for future AI-generated progressions:

- **types.ts**: `ProgressionGenerationRequest`, `ProgressionProvider` interface
- **localProvider.ts**: Local implementation that filters the built-in library
- **README.md**: Instructions for future LLM integration

## Data Flow

```
User clicks "Generate Exercise"
  → ExerciseGenerator selects progression from library
  → Harmony engine converts roman → chord symbols
  → Voicing engine creates voiced chords from policy
  → Scheduler converts voiced chords to timed events
  → User clicks "Play"
  → Tone engine plays events through PolySynth
  → User selects answer
  → Scoring records result
  → Feedback displayed
```

## Design Boundaries (DO NOT VIOLATE)

1. Harmony layer knows nothing about audio
2. Playback layer knows nothing about roman numerals or music theory
3. Exercise generator does not reference UI or audio
4. Voicing engine does not reference exercise types
5. UI components do not contain music theory logic
6. AI output must be validated before use
