# Chord Progression Trainer

This is a local Web MVP for training chord progression recognition with Roman numerals, function groups, bass degrees, voicing, and playback kept in separate layers.

## Quick Start

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## Current Features

- 24 major/minor keys through chromatic tonics.
- Built-in progression library split into major basic, minor basic, pop, and jazz basic files.
- Exercise types: identify progression, fill missing chord, detect replacement, identify function, identify bass degrees.
- Instrument presets: Piano Clear, Piano Smooth, Guitar Open Chords, String Quartet Basic.
- Sound engines: Tone.js sampler and Web MIDI output.
- Debug page showing exercise, voiced chords, and instrument events JSON.

## Practice Types

- Identify Progression: choose the full Roman numeral progression.
- Fill Missing Chord: choose the hidden chord in context.
- Detect Replacement: identify the chord heard at a replaced position.
- Identify Function: choose the T / PD / D sequence.
- Identify Bass Degrees: choose the scale-degree bass sequence.

## Tech Stack

Vite, React, TypeScript, Tone.js, Tonal.js, Vitest, and plain CSS.

## FAQ

Sampler playback downloads Salamander piano samples from the Tone.js CDN on first use. MIDI output requires a browser with Web MIDI support and an available MIDI output port.
