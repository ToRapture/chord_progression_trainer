# Architecture

The app is organized around stable domain boundaries:

- `src/core/harmony`: Roman numeral parsing, key rendering, chord symbols, function groups, validation.
- `src/core/progressions`: abstract progression templates.
- `src/core/exercises`: exercise generation, distractors, scoring.
- `src/core/voicing`: concrete MIDI note selection and voice leading.
- `src/core/playback`: event scheduling, Tone.js sampler, Web MIDI engine.
- `src/app`: React state, controls, Trainer, Library, and Debug views.

The important invariant is that Roman numerals are the internal musical template representation. Concrete notes only appear after rendering and voicing.
