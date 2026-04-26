# Chord Progression Trainer

A browser-based ear-training app for chord progressions. Generates exercises from a curated library of 72 progressions, voices them with smooth voice leading, and plays them back through Tone.js (Salamander Grand Piano samples) or any Web MIDI output.

## Stack

- Vite 5 + React 18 + TypeScript 5 (strict)
- [@tonaljs/tonal](https://github.com/tonaljs/tonal) — music theory parsing
- [tone](https://tonejs.github.io/) — Web Audio scheduling + sampler
- Web MIDI API — external instrument output
- Vitest — unit tests

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # 110 unit tests
npm run lint      # tsc strict type-check
npm run build     # type-check + vite build → dist/
npm run preview   # serve the built bundle
```

## What's in it

- **Trainer**: pick a key, mode, exercise type, instrument preset, tempo, and output (Web Audio or MIDI). Three exercise types are implemented:
  - `identify_progression` — listen, choose the matching Roman-numeral progression.
  - `fill_missing_chord` — one slot blanked, pick the missing chord.
  - `detect_replacement` — one chord swapped, pick which position changed.
- **Library**: browse all 72 progressions across 4 groups (`majorBasic`, `minorBasic`, `pop`, `jazzBasic`). Filter by name/tag/Roman, preview in any of 12 keys.
- **Debug**: type any space-separated Roman-numeral string and inspect the resolved chord symbols, function groups, and exact MIDI voicings the engine produces.

## Architecture

Layered, with strict one-way dependencies:

```
ui (src/app)
  → playback (Tone.js, Web MIDI)
  → voicing (candidate gen + voice-leading scorer)
  → harmony (Roman parsing, key resolution, function groups)
  → progressions (curated templates) / exercises (generators)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more, [docs/MUSIC_THEORY_NOTES.md](docs/MUSIC_THEORY_NOTES.md) for theory choices (e.g. harmonic-minor V/vii°), and [PROJECT_MAP.md](PROJECT_MAP.md) for a file-by-file directory.

## Extension points

- `src/core/ai/` — `ProgressionAIProvider` interface ready for an LLM-backed generator. The current `LocalAIStubProvider` throws; swap it for a real impl without touching the rest of the app.
- `src/core/instruments/` — add new instrument presets by writing a descriptor + voicing policy.
- `src/core/progressions/` — add more `ProgressionTemplate` arrays; they auto-register through `index.ts`.
- `src/core/exercises/generateExercise.ts` — `identify_function` and `identify_bass_degrees` are stubs returning `null`; implement the cases to add new exercise types.

See [AGENT_GUIDE.md](AGENT_GUIDE.md) for the contract that lets future agents (or you) extend the system safely.

## Audio samples

Tone.js loads the Salamander Grand Piano from `https://tonejs.github.io/audio/salamander/` on first interaction, so initial playback has a network delay. To self-host, drop the samples in `public/samples/` and point `SALAMANDER_BASE` in `src/core/playback/toneEngine.ts` at `/samples/`. See [public/samples/README.md](public/samples/README.md).
