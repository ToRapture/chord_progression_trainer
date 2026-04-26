# PROJECT_MAP

```
chord_progression_trainer_claude/
├── index.html                       Vite entry, mounts /src/app/main.tsx
├── package.json                     scripts: dev, build, test, lint
├── tsconfig.json                    strict TS for src/
├── tsconfig.node.json               TS for vite.config.ts / vitest.config.ts
├── vite.config.ts                   React plugin, port 5173
├── vitest.config.ts                 Vitest setup
│
├── README.md
├── AGENT_GUIDE.md                   how to extend safely
├── PROJECT_MAP.md                   this file
├── chord_progression_trainer_agent_spec.md   original spec
│
├── docs/
│   ├── ARCHITECTURE.md              layering + dataflow
│   ├── MUSIC_THEORY_NOTES.md        harmonic-minor lift, function groups, voicing scoring
│   └── superpowers/plans/
│       └── 2026-04-25-chord-progression-trainer-mvp.md
│
├── public/
│   └── samples/README.md            how to self-host Salamander samples
│
└── src/
    ├── app/                         UI layer (React)
    │   ├── main.tsx                 ReactDOM root
    │   ├── App.tsx                  tab shell
    │   ├── styles.css               dark theme
    │   ├── components/
    │   │   └── ChordStrip.tsx       horizontal chord cells
    │   └── pages/
    │       ├── TrainerPage.tsx      generate + play + answer exercises
    │       ├── LibraryPage.tsx      browse all 72 progressions
    │       └── DebugPage.tsx        inspect voicing for any Roman input
    │
    ├── core/                        no React, no DOM imports
    │   ├── harmony/
    │   │   ├── types.ts             Mode, FunctionGroup, KeySignature, ChordInKey
    │   │   ├── keys.ts              MAJOR_KEYS, MINOR_KEYS, default vocab per mode
    │   │   ├── roman.ts             parseRoman: degree, flat, quality, seventh
    │   │   ├── chordSymbols.ts      Roman + key → chord symbol (handles harmonic minor)
    │   │   ├── functionGroups.ts    T / PD / D / OTHER per mode
    │   │   └── validateProgression.ts   schema + roman-allowed check
    │   │
    │   ├── progressions/            72 ProgressionTemplates total
    │   │   ├── types.ts
    │   │   ├── majorBasic.ts        25 templates
    │   │   ├── minorBasic.ts        18 templates
    │   │   ├── pop.ts               17 templates
    │   │   ├── jazzBasic.ts         12 templates
    │   │   └── index.ts             aggregate + getProgressionsByGroup
    │   │
    │   ├── exercises/
    │   │   ├── types.ts             ExerciseType, ExerciseChoice, Exercise
    │   │   ├── distractors.ts       confusable-Roman pair table + shuffle
    │   │   ├── generateExercise.ts  three implemented types + two stubs
    │   │   └── scoring.ts           scoreAnswer
    │   │
    │   ├── voicing/                 candidate generation + scoring
    │   │   ├── types.ts             VoicedChord, VoicingPolicy, InstrumentEvent
    │   │   ├── pitchUtils.ts        pitch-class ↔ MIDI helpers
    │   │   ├── presets.ts           4 voicing policies
    │   │   ├── generateCandidates.ts   bass options × upper-voice rotations
    │   │   ├── voiceLeading.ts      score: movement + leap + range + muddy
    │   │   ├── chooseBestVoicing.ts pick min score
    │   │   └── index.ts             voiceProgression entry
    │   │
    │   ├── instruments/             descriptors per preset
    │   │   ├── types.ts
    │   │   ├── piano.ts             clear + smooth
    │   │   ├── guitar.ts            open
    │   │   ├── strings.ts           quartet basic
    │   │   └── index.ts             INSTRUMENTS map
    │   │
    │   ├── playback/
    │   │   ├── types.ts
    │   │   ├── scheduler.ts         VoicedChord[] → InstrumentEvent[]
    │   │   ├── toneEngine.ts        Tone.Sampler (Salamander piano)
    │   │   └── midiEngine.ts        Web MIDI output
    │   │
    │   └── ai/
    │       ├── types.ts             ProgressionAIProvider interface
    │       ├── localProvider.ts     stub (throws "not implemented")
    │       └── README.md
    │
    └── tests/
        ├── harmony.test.ts                  24 tests
        ├── progressionValidation.test.ts    74 tests (incl. one per template)
        ├── exerciseGeneration.test.ts        6 tests
        └── voicing.test.ts                   6 tests
```

110 tests total. UI is not unit-tested; the Debug page is the manual test surface.
