# Project Map

## Core Directories

- `src/core/harmony`: theory primitives and Roman to chord rendering.
- `src/core/progressions`: built-in progression library.
- `src/core/exercises`: exercise objects, choices, distractors, scoring.
- `src/core/voicing`: MIDI note voicing from chord symbols.
- `src/core/playback`: scheduler and playback engines.
- `src/core/ai`: future AI generation interface.
- `src/app`: React UI and global app state.

## Example Call Chain

```text
User clicks Generate Exercise
-> App.handleGenerateExercise
-> exercises/generateExercise.ts
-> harmony/roman.ts
-> voicing/index.ts
-> playback/scheduler.ts
```

```text
User clicks Play
-> TrainerPage
-> App.handlePlay
-> toneEngine.playEvents or midiEngine.playEvents
```

```text
User clicks a chord block
-> App.handlePlayChord
-> VoicedChord.allNotes
-> playback engine playChord()
```
