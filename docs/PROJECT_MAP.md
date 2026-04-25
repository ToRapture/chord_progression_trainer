# Project Map

Quick navigation guide for new developers and AI agents.

## Directory Structure

```
chord_progression_trainer/
├── index.html                          # Entry HTML
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite bundler config
├── vitest.config.ts                    # Test runner config
├── public/
│   └── samples/                        # Future audio samples
│       └── README.md
├── docs/
│   ├── ARCHITECTURE.md                 # System architecture overview
│   ├── PROJECT_MAP.md                  # This file
│   ├── FUTURE_AGENT_GUIDE.md          # Guide for future AI agents
│   └── MUSIC_THEORY_NOTES.md          # Music theory primer
└── src/
    ├── app/
    │   ├── main.tsx                    # React entry point
    │   ├── App.tsx                     # Main app component with tabs
    │   └── styles.css                  # Global styles (dark theme)
    ├── core/
    │   ├── harmony/                    # Music theory foundation
    │   │   ├── types.ts                # Core type definitions
    │   │   ├── keys.ts                 # Supported keys (6 keys)
    │   │   ├── roman.ts                # Roman numeral ↔ chord symbol
    │   │   ├── chordSymbols.ts         # Chord parsing, MIDI helpers
    │   │   ├── functionGroups.ts       # T/PD/D function classification
    │   │   └── validateProgression.ts  # Validation rules
    │   ├── progressions/               # Chord progression library
    │   │   ├── types.ts                # ProgressionTemplate type
    │   │   ├── majorBasic.ts           # 25 major key progressions
    │   │   ├── minorBasic.ts           # 18 minor key progressions
    │   │   ├── pop.ts                  # 17 pop/rock progressions
    │   │   ├── jazzBasic.ts            # 12 jazz progressions
    │   │   └── index.ts                # Query/filter interface
    │   ├── exercises/                  # Exercise logic
    │   │   ├── types.ts                # Exercise, ExerciseChoice types
    │   │   ├── generateExercise.ts     # 3 exercise type generators
    │   │   ├── distractors.ts          # Wrong answer generation
    │   │   └── scoring.ts              # Answer tracking and scoring
    │   ├── voicing/                    # Voicing engine
    │   │   ├── types.ts                # VoicedChord, VoicingPolicy
    │   │   ├── pitchUtils.ts           # MIDI/note conversion
    │   │   ├── generateCandidates.ts   # Voicing candidate generation
    │   │   ├── voiceLeading.ts         # Candidate scoring algorithm
    │   │   ├── chooseBestVoicing.ts    # Best voicing selection
    │   │   ├── presets.ts              # 4 voicing presets
    │   │   └── index.ts                # Public API exports
    │   ├── instruments/                # Instrument configs
    │   │   ├── types.ts                # InstrumentEvent, Articulation
    │   │   ├── piano.ts                # Piano envelope configs
    │   │   ├── guitar.ts               # Guitar open chord shapes
    │   │   ├── strings.ts              # String quartet voicing
    │   │   └── index.ts                # Public API exports
    │   ├── playback/                   # Audio playback
    │   │   ├── types.ts                # PlaybackOptions
    │   │   ├── scheduler.ts            # Chord → timed event conversion
    │   │   └── toneEngine.ts           # Tone.js wrapper
    │   └── ai/                         # Future AI integration
    │       ├── types.ts                # AI provider interface
    │       ├── localProvider.ts        # Local library-based provider
    │       └── README.md               # AI integration guide
    ├── data/
    │   └── README.md                   # Placeholder for data files
    └── tests/
        ├── harmony.test.ts             # Roman conversion, function groups
        ├── progressionValidation.test.ts # Library integrity, validation
        ├── voicing.test.ts             # Voicing engine, voice leading
        └── exerciseGeneration.test.ts  # Exercise generation, scoring
```

## Key Files by Role

### To add a new key/tonality
- `src/core/harmony/keys.ts` — Add to `SUPPORTED_KEYS`

### To add a new progression
- `src/core/progressions/majorBasic.ts` (or minorBasic / pop / jazzBasic)
- Add entry with id, roman, functions, etc.

### To add a new exercise type
- `src/core/exercises/types.ts` — Add to `ExerciseType` union
- `src/core/exercises/generateExercise.ts` — Add generator function
- `src/core/exercises/distractors.ts` — Add distractor logic if needed

### To add a new instrument
- `src/core/instruments/types.ts` — Add to `InstrumentPresetId`
- `src/core/instruments/<name>.ts` — Create instrument config
- `src/core/instruments/index.ts` — Export
- `src/core/voicing/presets.ts` — Add voicing preset

### To add a new voicing preset
- `src/core/voicing/presets.ts` — Add `VoicingPolicy` object

### To change playback behavior
- `src/core/playback/toneEngine.ts` — Audio synthesis
- `src/core/playback/scheduler.ts` — Timing and patterns

### To change the UI
- `src/app/App.tsx` — All UI components (TrainerPage, LibraryPage, DebugPage)
- `src/app/styles.css` — Visual styling

## Example Call Chain

```
User selects C major, identify_progression, piano_clear → clicks Generate

generateExercise(options)
  → selectProgression(options) from progression library
  → romanToChordSymbol(roman, key) for each chord
  → voiceProgression(chordSymbols, romans, policy)
  → scheduleVoicedChords(voicedChords, options, preset)

User clicks Play

playEvents(instrumentEvents)
  → Tone.start()
  → PolySynth.triggerAttackRelease() for each event

User selects answer → clicks Submit

checkAnswer(exerciseId, selectedChoiceId, answerChoiceId)
  → recordResult()
  → feedback displayed
```
