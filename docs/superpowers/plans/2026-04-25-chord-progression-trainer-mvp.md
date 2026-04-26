# Chord Progression Trainer MVP Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable, locally-served Web app that trains users to identify chord progressions, missing chords, and chord substitutions in a chosen key — using Vite + React + TypeScript, with Tone.js sampler playback, Tonal.js for harmonic theory, and Vitest for the core music engine. The architecture must keep harmony, voicing, playback, and UI as separate layers so AI generation, more instruments, and more exercise types can plug in later.

**Architecture:** Five core layers under `src/core/` — `harmony` (theory primitives, key vocabularies, validators), `progressions` (Roman-numeral templates), `exercises` (generators, distractors, scoring), `voicing` (chord-symbol → MIDI notes with voice-leading scoring per instrument preset), `playback` (Tone.Sampler + Web MIDI engines fed by a scheduler). UI lives in `src/app/` and only consumes typed data from those layers. All exercise data flows: `RomanNumeral[] → ChordSymbol[] → VoicedChord[] → InstrumentEvent[] → audio/MIDI`. AI generation gets a stub directory `src/core/ai/` with a no-op provider so the validator can be wired up later.

**Tech Stack:** Vite, React 18, TypeScript (strict), Tone.js (Sampler + Reverb), Tonal.js (`@tonaljs/tonal`), Vitest, plain CSS (no Tailwind, no CSS Modules). React `useState` / `useCallback` / `useMemo` for state — no Zustand.

**Source spec:** `chord_progression_trainer_agent_spec.md` (in repo root). When in doubt, follow the spec sections referenced in each task.

**Working directory:** `D:\Codes\github\ToRapture\chord_progression_trainer_claude` — files are created directly here, not in a subdirectory.

---

## File Structure (target end state)

```
chord_progression_trainer_claude/
  package.json
  package-lock.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  vitest.config.ts
  index.html
  .gitignore
  README.md
  AGENT_GUIDE.md
  PROJECT_MAP.md
  docs/
    ARCHITECTURE.md
    MUSIC_THEORY_NOTES.md
    superpowers/plans/2026-04-25-chord-progression-trainer-mvp.md   (this file)
  public/
    samples/README.md
  src/
    app/
      main.tsx
      App.tsx
      styles.css
    core/
      ai/
        types.ts
        localProvider.ts
        README.md
      harmony/
        types.ts
        keys.ts
        roman.ts
        chordSymbols.ts
        functionGroups.ts
        validateProgression.ts
      progressions/
        types.ts
        index.ts
        majorBasic.ts
        minorBasic.ts
        pop.ts
        jazzBasic.ts
      exercises/
        types.ts
        distractors.ts
        scoring.ts
        generateExercise.ts
      voicing/
        types.ts
        pitchUtils.ts
        generateCandidates.ts
        voiceLeading.ts
        chooseBestVoicing.ts
        presets.ts
        index.ts
      instruments/
        types.ts
        piano.ts
        guitar.ts
        strings.ts
        index.ts
      playback/
        types.ts
        scheduler.ts
        toneEngine.ts
        midiEngine.ts
    tests/
      harmony.test.ts
      progressionValidation.test.ts
      exerciseGeneration.test.ts
      voicing.test.ts
```

Each file has one clear responsibility (spec §4). Layers depend strictly downward — `voicing` may import `harmony`, but `harmony` must never import `voicing` or `playback`.

---

## Phase 1 — Project Bootstrap

### Task 1: Create Vite + React + TS scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "chord-progression-trainer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc -b --noEmit"
  },
  "dependencies": {
    "@tonaljs/tonal": "^6.4.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tone": "^15.0.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/webmidi": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json` (strict, ESNext)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "webmidi"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Write `vite.config.ts` and `vitest.config.ts`**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Write `index.html` and `.gitignore`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chord Progression Trainer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

`.gitignore`:

```
node_modules
dist
.vscode
.idea
*.log
.DS_Store
```

- [ ] **Step 6: Run `npm install`**

Run: `npm install`
Expected: dependencies resolve, no errors. Lockfile generated.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts index.html .gitignore
git commit -m "chore: scaffold Vite + React + TS + Vitest project"
```

---

## Phase 2 — Harmony Core

This phase is pure logic, no DOM, no audio. Test-driven where useful.

### Task 2: Harmony types

**Files:**
- Create: `src/core/harmony/types.ts`

- [ ] **Step 1: Write the type definitions verbatim from spec §6.1**

```ts
export type Mode = "major" | "minor";

export type FunctionGroup = "T" | "PD" | "D" | "OTHER";

export type RomanNumeral = string;
export type ChordSymbol = string;
export type NoteName = string;
export type PitchClass = string;

export type KeySignature = {
  tonic: string;
  mode: Mode;
};

export type ChordInKey = {
  roman: RomanNumeral;
  symbol: ChordSymbol;
  functionGroup: FunctionGroup;
  scaleDegree: number;
  chordTones: PitchClass[];
  source:
    | "diatonic"
    | "harmonic_minor"
    | "melodic_minor"
    | "borrowed"
    | "secondary_dominant"
    | "custom";
};
```

### Task 3: Key vocabularies

**Files:**
- Create: `src/core/harmony/keys.ts`

- [ ] **Step 1: Implement `getMajorVocabulary` and `getMinorVocabulary`**

These return the default `RomanNumeral[]` for major and minor (spec §8.2). Also expose `MAJOR_KEYS` / `MINOR_KEYS` as the 12 chromatic tonic letters. Then a single helper `getDefaultVocabulary(mode: Mode): RomanNumeral[]`.

```ts
import type { Mode, RomanNumeral } from "./types";

export const MAJOR_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const MINOR_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const MAJOR_VOCAB: RomanNumeral[] = ["I", "ii", "iii", "IV", "V", "V7", "vi", "vii°"];
export const MINOR_VOCAB: RomanNumeral[] = ["i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°"];

export function getDefaultVocabulary(mode: Mode): RomanNumeral[] {
  return mode === "major" ? [...MAJOR_VOCAB] : [...MINOR_VOCAB];
}
```

### Task 4: Function-group classifier

**Files:**
- Create: `src/core/harmony/functionGroups.ts`

- [ ] **Step 1: Implement `getFunctionGroup(roman, mode)` per spec §8.2**

```ts
import type { FunctionGroup, Mode, RomanNumeral } from "./types";

const MAJOR_GROUPS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["I", "iii", "vi"],
  PD: ["ii", "IV"],
  D: ["V", "V7", "vii°"],
  OTHER: [],
};

const MINOR_GROUPS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["i", "III", "VI"],
  PD: ["ii°", "iv"],
  D: ["v", "V", "V7", "VII", "vii°"],
  OTHER: [],
};

export function getFunctionGroup(roman: RomanNumeral, mode: Mode): FunctionGroup {
  const groups = mode === "major" ? MAJOR_GROUPS : MINOR_GROUPS;
  for (const g of ["T", "PD", "D"] as const) {
    if (groups[g].includes(roman)) return g;
  }
  return "OTHER";
}

export function getFunctionGroupsForProgression(
  progression: RomanNumeral[],
  mode: Mode,
): FunctionGroup[] {
  return progression.map((r) => getFunctionGroup(r, mode));
}
```

### Task 5: Roman numeral parser

**Files:**
- Create: `src/core/harmony/roman.ts`

The spec wants Roman → chord symbol resolution that depends on key. Tonal.js exposes `Key.majorKey()` / `Key.minorKey()` which return arrays of triads/sevenths in the scale, but their Roman shapes do not include lowered Roman numerals like `bVII`. We implement a thin wrapper that:

1. Strips quality markers (`°`, `7`, `maj7`, `ø7`, `b`) from the Roman to derive a base degree.
2. Looks up the chord root and base quality from the diatonic chord at that degree (using Tonal `Key`).
3. Re-applies any explicit quality markers (e.g., `V7` → uppercase fifth + dominant 7th).
4. For minor mode `V` and `V7`, force a major triad/dominant 7th root (harmonic minor).
5. For `bVII` / `bVI` etc., flatten the diatonic root by a semitone.

- [ ] **Step 1: Implement `parseRoman(roman: RomanNumeral): { degree: number; quality: ChordQuality; flat: boolean; sevenths: SeventhType }`**

```ts
import type { RomanNumeral } from "./types";

export type ChordQuality = "major" | "minor" | "diminished" | "halfDim" | "augmented";
export type SeventhType = "none" | "dom7" | "maj7" | "min7" | "halfDim7" | "dim7";

export type ParsedRoman = {
  degree: number; // 1..7 in scale order
  flat: boolean;  // true if leading 'b'
  quality: ChordQuality;
  seventh: SeventhType;
  raw: RomanNumeral;
};

const ROMAN_DEGREES: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};

export function parseRoman(roman: RomanNumeral): ParsedRoman {
  let s = roman.trim();
  const flat = s.startsWith("b");
  if (flat) s = s.slice(1);

  // Capture trailing markers
  let seventh: SeventhType = "none";
  if (s.endsWith("maj7")) { seventh = "maj7"; s = s.slice(0, -4); }
  else if (s.endsWith("ø7")) { seventh = "halfDim7"; s = s.slice(0, -2); }
  else if (s.endsWith("°7")) { seventh = "dim7"; s = s.slice(0, -2); }
  else if (s.endsWith("7")) { seventh = "dom7"; s = s.slice(0, -1); }

  let dim = false;
  let halfDim = false;
  if (s.endsWith("ø")) { halfDim = true; s = s.slice(0, -1); }
  else if (s.endsWith("°")) { dim = true; s = s.slice(0, -1); }

  const lower = s.toLowerCase();
  const degree = ROMAN_DEGREES[lower];
  if (!degree) throw new Error(`Unknown Roman numeral: ${roman}`);

  const upper = s === s.toUpperCase();

  let quality: ChordQuality;
  if (dim) quality = "diminished";
  else if (halfDim) quality = "halfDim";
  else if (upper) quality = "major";
  else quality = "minor";

  // Reconcile seventh + triad quality (e.g., min7 if quality is minor + dom7 marker)
  if (seventh === "dom7" && quality === "minor") seventh = "min7";

  return { degree, flat, quality, seventh, raw: roman };
}
```

### Task 6: Chord-symbol resolver

**Files:**
- Create: `src/core/harmony/chordSymbols.ts`

- [ ] **Step 1: Implement `romanToChordSymbol(roman, key)` and `romanProgressionToChordSymbols`**

Use Tonal `Key` and `Note` to resolve scale degrees. For minor mode, the natural minor scale provides the diatonic roots; we then lift `V`/`V7`/`vii°` per harmonic minor.

```ts
import { Key, Note, Interval } from "@tonaljs/tonal";
import type { ChordSymbol, KeySignature, RomanNumeral } from "./types";
import { parseRoman, type ChordQuality, type SeventhType } from "./roman";

const MAJOR_INTERVALS = ["1P", "2M", "3M", "4P", "5P", "6M", "7M"];
const NATURAL_MINOR_INTERVALS = ["1P", "2M", "3m", "4P", "5P", "6m", "7m"];

function degreeRoot(tonic: string, degree: number, isMinor: boolean): string {
  const intervals = isMinor ? NATURAL_MINOR_INTERVALS : MAJOR_INTERVALS;
  const interval = intervals[degree - 1];
  const note = Note.transpose(tonic, interval);
  return Note.pitchClass(note);
}

function qualitySuffix(q: ChordQuality, s: SeventhType): string {
  if (s === "maj7") return "maj7";
  if (s === "dom7") return "7";
  if (s === "min7") return "m7";
  if (s === "halfDim7") return "m7b5";
  if (s === "dim7") return "dim7";
  if (q === "diminished") return "dim";
  if (q === "halfDim") return "m7b5";
  if (q === "augmented") return "aug";
  if (q === "minor") return "m";
  return ""; // major triad
}

export function romanToChordSymbol(roman: RomanNumeral, key: KeySignature): ChordSymbol {
  const parsed = parseRoman(roman);
  const isMinor = key.mode === "minor";
  let root = degreeRoot(key.tonic, parsed.degree, isMinor);

  // Harmonic minor: raise the 7th when V / V7 / vii° appear in minor
  if (isMinor && (parsed.degree === 5 && (parsed.quality === "major" || parsed.seventh === "dom7"))) {
    // root for the 5th is unchanged but quality is forced major
  }
  if (isMinor && parsed.degree === 7 && parsed.quality === "diminished") {
    // raise the natural 7th (b7) by a semitone to leading-tone (e.g. G → G#)
    root = Note.transpose(root, "1A"); // augmented unison = +1 semitone
    root = Note.pitchClass(root);
  }

  if (parsed.flat) {
    root = Note.pitchClass(Note.transpose(root, "1d")); // diminished unison = -1 semitone
  }

  return root + qualitySuffix(parsed.quality, parsed.seventh);
}

export function romanProgressionToChordSymbols(
  progression: RomanNumeral[],
  key: KeySignature,
): ChordSymbol[] {
  return progression.map((r) => romanToChordSymbol(r, key));
}
```

### Task 7: Progression validator

**Files:**
- Create: `src/core/harmony/validateProgression.ts`

- [ ] **Step 1: Implement `validateProgressionTemplate` and `validateProgressionAgainstOptions` (spec §10)**

```ts
import type { RomanNumeral, Mode } from "./types";
import type { ProgressionTemplate } from "../progressions/types";
import { parseRoman } from "./roman";

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validateProgressionTemplate(t: ProgressionTemplate): ValidationResult {
  const errors: string[] = [];
  if (!t.id) errors.push("Missing id");
  if (!t.roman || t.roman.length === 0) errors.push("Empty roman");
  if (!t.functions || t.functions.length !== t.roman.length)
    errors.push("functions length must equal roman length");
  if (!t.tags || t.tags.length === 0) errors.push("tags must be non-empty");
  if (t.difficulty < 1 || t.difficulty > 5) errors.push("difficulty out of range");

  for (const r of t.roman ?? []) {
    try { parseRoman(r); } catch (e) {
      errors.push(`Unparseable roman: ${r}`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export type ValidateAgainstOptions = {
  allowedRomans: RomanNumeral[];
  mode: Mode;
};

export function validateProgressionAgainstOptions(
  progression: RomanNumeral[],
  opts: ValidateAgainstOptions,
): ValidationResult {
  const errors: string[] = [];
  for (const r of progression) {
    if (!opts.allowedRomans.includes(r)) errors.push(`Roman not allowed: ${r}`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
```

- [ ] **Step 2: Commit Phase 2**

```bash
git add src/core/harmony
git commit -m "feat(harmony): types, key vocabularies, roman parser, chord-symbol resolver, validator"
```

---

## Phase 3 — Progression Library

### Task 8: Progression types

**Files:**
- Create: `src/core/progressions/types.ts`

- [ ] **Step 1: Use spec §6.2 types verbatim**

```ts
import type { FunctionGroup, RomanNumeral } from "../harmony/types";

export type ProgressionTemplate = {
  id: string;
  name: string;
  mode: "major" | "minor" | "both";
  roman: RomanNumeral[];
  functions: FunctionGroup[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  description: string;
  cadence?: "authentic" | "plagal" | "half" | "deceptive" | "loop" | "none";
};
```

### Task 9: Major Basic library (25 entries)

**Files:**
- Create: `src/core/progressions/majorBasic.ts`

- [ ] **Step 1: Author all 25 templates from spec §7.1**

Each entry must include `id`, `name`, `mode: "major"`, `roman`, `functions` (computed by hand to match Roman array length), `difficulty (1-5)`, `tags`, `description`, `cadence`. Include the 16 progressions explicitly listed in spec §7.1; fill the remaining 9 with common variants (`I-V-vi-IV-V`, `I-IV-I-V-I`, `IV-I-V-vi`, `vi-V-IV-V`, `I-iii-vi-ii-V-I`, `I-V-vi-iii-IV-I-IV-V`, `I-IV-V-vi-IV-V-I`, `I-vi-ii-V-I`, `I-IV-vi-iii-IV-I-ii-V`).

Sample entry:

```ts
import type { ProgressionTemplate } from "./types";

export const majorBasic: ProgressionTemplate[] = [
  {
    id: "maj-basic-001",
    name: "I - V - I (Authentic Cadence)",
    mode: "major",
    roman: ["I", "V", "I"],
    functions: ["T", "D", "T"],
    difficulty: 1,
    tags: ["basic", "cadence"],
    description: "Simplest authentic cadence demonstrating the tonic-dominant-tonic motion.",
    cadence: "authentic",
  },
  // ... 24 more
];
```

### Task 10: Minor Basic library (18 entries)

**Files:**
- Create: `src/core/progressions/minorBasic.ts`

- [ ] **Step 1: Author all 18 templates from spec §7.2**

Note: when `V` or `V7` appear in minor, mark `tags` to include `"harmonic-minor"`. Functions for `VII` use `"D"` per the spec hint (treat `VII` as D-like).

### Task 11: Pop library (17 entries)

**Files:**
- Create: `src/core/progressions/pop.ts`

- [ ] **Step 1: Author all 17 templates from spec §7.3**

Mark `mode: "major"` for all unless explicitly minor. Tag `"pop"`.

### Task 12: Jazz Basic library (12 entries)

**Files:**
- Create: `src/core/progressions/jazzBasic.ts`

- [ ] **Step 1: Author all 12 templates from spec §7.4**

These use seventh chords (`Imaj7`, `ii7`, `V7`, `iii7`, `vi7`, `viiø7`, `VI7`). Set `difficulty` ≥ 3. Tag `"jazz"`.

### Task 13: Library index

**Files:**
- Create: `src/core/progressions/index.ts`

- [ ] **Step 1: Aggregate, group, and filter**

```ts
import type { ProgressionTemplate } from "./types";
import { majorBasic } from "./majorBasic";
import { minorBasic } from "./minorBasic";
import { pop } from "./pop";
import { jazzBasic } from "./jazzBasic";

export const PROGRESSION_GROUPS = {
  majorBasic,
  minorBasic,
  pop,
  jazzBasic,
} as const;

export type ProgressionGroupId = keyof typeof PROGRESSION_GROUPS | "all";

export function getAllProgressions(): ProgressionTemplate[] {
  return [...majorBasic, ...minorBasic, ...pop, ...jazzBasic];
}

export function getProgressionsByGroup(group: ProgressionGroupId): ProgressionTemplate[] {
  if (group === "all") return getAllProgressions();
  return [...PROGRESSION_GROUPS[group]];
}
```

- [ ] **Step 2: Commit Phase 3**

```bash
git add src/core/progressions
git commit -m "feat(progressions): 72 templates across major/minor/pop/jazz libraries"
```

---

## Phase 4 — Exercise Engine

### Task 14: Exercise types

**Files:**
- Create: `src/core/exercises/types.ts`

- [ ] **Step 1: Use spec §6.3 types verbatim**

```ts
import type {
  ChordSymbol, FunctionGroup, KeySignature, RomanNumeral,
} from "../harmony/types";
import type { InstrumentPresetId } from "../voicing/types";

export type ExerciseType =
  | "identify_progression"
  | "fill_missing_chord"
  | "detect_replacement"
  | "identify_function"
  | "identify_bass_degrees";

export type ExerciseChoice = {
  id: string;
  label: string;
  roman?: RomanNumeral[];
  functions?: FunctionGroup[];
  bassDegrees?: number[];
  isCorrect: boolean;
};

export type Exercise = {
  id: string;
  type: ExerciseType;
  key: KeySignature;
  originalProgression: RomanNumeral[];
  renderedChords: ChordSymbol[];
  promptProgression?: (RomanNumeral | null)[];
  targetIndex?: number;
  choices: ExerciseChoice[];
  answerId: string;
  explanation: string;
  metadata: { difficulty: number; tags: string[]; instrumentPreset: InstrumentPresetId };
};

export type ExerciseGenerationOptions = {
  key: KeySignature;
  allowedRomans: RomanNumeral[];
  exerciseType: ExerciseType;
  difficultyRange: [number, number];
  tags?: string[];
  groupId?: string;
  instrumentPreset: InstrumentPresetId;
  choiceCount: number;
};
```

### Task 15: Distractors helper

**Files:**
- Create: `src/core/exercises/distractors.ts`

- [ ] **Step 1: Implement confusable-pair table and helpers**

```ts
import type { Mode, RomanNumeral } from "../harmony/types";
import { getDefaultVocabulary } from "../harmony/keys";
import { getFunctionGroup } from "../harmony/functionGroups";

export const CONFUSABLE_PAIRS: [RomanNumeral, RomanNumeral][] = [
  ["IV", "ii"], ["vi", "iii"], ["V", "vii°"],
  ["I", "vi"], ["V", "V7"], ["iv", "ii°"], ["VI", "iv"],
];

export function pickConfusableDistractors(
  target: RomanNumeral,
  mode: Mode,
  allowed: RomanNumeral[],
  count: number,
): RomanNumeral[] {
  const pool = new Set<RomanNumeral>();
  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (a === target && allowed.includes(b)) pool.add(b);
    if (b === target && allowed.includes(a)) pool.add(a);
  }
  const targetGroup = getFunctionGroup(target, mode);
  for (const r of allowed) {
    if (r === target) continue;
    if (getFunctionGroup(r, mode) === targetGroup) pool.add(r);
  }
  for (const r of allowed) {
    if (r !== target) pool.add(r);
    if (pool.size >= count + 5) break;
  }
  pool.delete(target);
  const arr = [...pool];
  return shuffleInPlace(arr).slice(0, count);
}

export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

### Task 16: Scoring helper

**Files:**
- Create: `src/core/exercises/scoring.ts`

- [ ] **Step 1: Implement `scoreAnswer(exercise, choiceId)`**

```ts
import type { Exercise } from "./types";

export type ScoredAnswer = {
  correct: boolean;
  explanation: string;
};

export function scoreAnswer(exercise: Exercise, choiceId: string): ScoredAnswer {
  const correct = exercise.answerId === choiceId;
  return { correct, explanation: exercise.explanation };
}
```

### Task 17: Exercise generator

**Files:**
- Create: `src/core/exercises/generateExercise.ts`

- [ ] **Step 1: Implement `generateExercise(options): Exercise | null`** — three working types per spec §9 plus stubs for the two unimplemented types that throw a descriptive error.

```ts
import type {
  Exercise, ExerciseChoice, ExerciseGenerationOptions, ExerciseType,
} from "./types";
import type { ProgressionTemplate } from "../progressions/types";
import type { RomanNumeral } from "../harmony/types";
import { getAllProgressions, getProgressionsByGroup } from "../progressions";
import { romanProgressionToChordSymbols } from "../harmony/chordSymbols";
import { getFunctionGroupsForProgression } from "../harmony/functionGroups";
import { pickConfusableDistractors, shuffleInPlace } from "./distractors";

let exerciseCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++exerciseCounter}`;

function pickTemplate(opts: ExerciseGenerationOptions): ProgressionTemplate | null {
  const pool = (opts.groupId ? getProgressionsByGroup(opts.groupId as any) : getAllProgressions())
    .filter((t) => t.mode === opts.key.mode || t.mode === "both")
    .filter((t) => t.difficulty >= opts.difficultyRange[0] && t.difficulty <= opts.difficultyRange[1])
    .filter((t) => t.roman.every((r) => opts.allowedRomans.includes(r)));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateExercise(opts: ExerciseGenerationOptions): Exercise | null {
  switch (opts.exerciseType) {
    case "identify_progression": return generateIdentifyProgression(opts);
    case "fill_missing_chord":   return generateFillMissingChord(opts);
    case "detect_replacement":   return generateDetectReplacement(opts);
    case "identify_function":
    case "identify_bass_degrees":
      return null; // UI shows "not implemented yet"
  }
}

function generateIdentifyProgression(opts: ExerciseGenerationOptions): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const correctChoice: ExerciseChoice = {
    id: "c-correct",
    label: tpl.roman.join(" - "),
    roman: tpl.roman,
    isCorrect: true,
  };
  const otherTemplates = getAllProgressions()
    .filter((t) => t.id !== tpl.id && t.roman.length === tpl.roman.length
      && (t.mode === opts.key.mode || t.mode === "both")
      && t.roman.every((r) => opts.allowedRomans.includes(r)));
  shuffleInPlace(otherTemplates);
  const distractors = otherTemplates.slice(0, opts.choiceCount - 1).map((t, i): ExerciseChoice => ({
    id: `c-d${i}`,
    label: t.roman.join(" - "),
    roman: t.roman,
    isCorrect: false,
  }));
  const choices = shuffleInPlace([correctChoice, ...distractors]);
  return {
    id: nextId("ex-id"),
    type: "identify_progression",
    key: opts.key,
    originalProgression: tpl.roman,
    renderedChords: romanProgressionToChordSymbols(tpl.roman, opts.key),
    choices,
    answerId: correctChoice.id,
    explanation: `${tpl.name}. Functions: ${getFunctionGroupsForProgression(tpl.roman, opts.key.mode).join("-")}.`,
    metadata: { difficulty: tpl.difficulty, tags: tpl.tags, instrumentPreset: opts.instrumentPreset },
  };
}

function generateFillMissingChord(opts: ExerciseGenerationOptions): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const targetIndex = 1 + Math.floor(Math.random() * Math.max(1, tpl.roman.length - 1));
  const target = tpl.roman[targetIndex];
  const promptProgression = tpl.roman.map((r, i) => (i === targetIndex ? null : r));
  const distractors = pickConfusableDistractors(target, opts.key.mode, opts.allowedRomans, opts.choiceCount - 1);
  const correctChoice: ExerciseChoice = {
    id: "c-correct", label: target, roman: [target], isCorrect: true,
  };
  const others = distractors.map((d, i): ExerciseChoice => ({
    id: `c-d${i}`, label: d, roman: [d], isCorrect: false,
  }));
  const choices = shuffleInPlace([correctChoice, ...others]);
  return {
    id: nextId("ex-fill"),
    type: "fill_missing_chord",
    key: opts.key,
    originalProgression: tpl.roman,
    renderedChords: romanProgressionToChordSymbols(tpl.roman, opts.key),
    promptProgression,
    targetIndex,
    choices,
    answerId: correctChoice.id,
    explanation: `Missing chord at position ${targetIndex + 1} is ${target}.`,
    metadata: { difficulty: tpl.difficulty, tags: tpl.tags, instrumentPreset: opts.instrumentPreset },
  };
}

function generateDetectReplacement(opts: ExerciseGenerationOptions): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const targetIndex = Math.floor(Math.random() * tpl.roman.length);
  const original = tpl.roman[targetIndex];
  const replacementCandidates = pickConfusableDistractors(original, opts.key.mode, opts.allowedRomans, 1);
  if (!replacementCandidates.length) return null;
  const replacement = replacementCandidates[0];
  const replaced = tpl.roman.map((r, i) => (i === targetIndex ? replacement : r));
  const correctChoice: ExerciseChoice = {
    id: "c-correct",
    label: `Position ${targetIndex + 1} (${original} → ${replacement})`,
    roman: [replacement],
    isCorrect: true,
  };
  const otherIndices = tpl.roman
    .map((_, i) => i)
    .filter((i) => i !== targetIndex);
  shuffleInPlace(otherIndices);
  const distractors = otherIndices.slice(0, opts.choiceCount - 1).map((i, k): ExerciseChoice => ({
    id: `c-d${k}`, label: `Position ${i + 1}`, isCorrect: false,
  }));
  const choices = shuffleInPlace([correctChoice, ...distractors]);
  return {
    id: nextId("ex-rep"),
    type: "detect_replacement",
    key: opts.key,
    originalProgression: replaced,
    renderedChords: romanProgressionToChordSymbols(replaced, opts.key),
    targetIndex,
    choices,
    answerId: correctChoice.id,
    explanation: `Position ${targetIndex + 1}: original was ${original}, replaced by ${replacement}.`,
    metadata: { difficulty: tpl.difficulty, tags: tpl.tags, instrumentPreset: opts.instrumentPreset },
  };
}
```

- [ ] **Step 2: Commit Phase 4**

```bash
git add src/core/exercises
git commit -m "feat(exercises): generator + distractors + scoring for 3 exercise types"
```

---

## Phase 5 — Voicing Engine

### Task 18: Voicing types and presets

**Files:**
- Create: `src/core/voicing/types.ts`, `src/core/voicing/presets.ts`

- [ ] **Step 1: Use spec §6.4 types verbatim**

(see types in spec §6.4)

- [ ] **Step 2: Define `VoicingPolicy` instances per preset (spec §11.4–11.7)**

```ts
import type { VoicingPolicy, InstrumentPresetId } from "./types";

export const VOICING_PRESETS: Record<InstrumentPresetId, VoicingPolicy> = {
  piano_clear: {
    id: "piano_clear", name: "Piano Clear",
    bassRange: [36, 48],   // C2..C3
    upperRange: [60, 76],  // C4..E5
    upperVoiceCount: 3,
    preferRootBass: true, allowInversions: false, allowOmitFifth: false,
    allowExtensions: false, smoothVoiceLeading: true, maxUpperVoiceLeap: 7,
  },
  piano_smooth: {
    id: "piano_smooth", name: "Piano Smooth",
    bassRange: [36, 48], upperRange: [55, 74], upperVoiceCount: 3,
    preferRootBass: true, allowInversions: true, allowOmitFifth: true,
    allowExtensions: false, smoothVoiceLeading: true, maxUpperVoiceLeap: 5,
  },
  guitar_open: {
    id: "guitar_open", name: "Guitar Open",
    bassRange: [40, 52], upperRange: [50, 76], upperVoiceCount: 4,
    preferRootBass: true, allowInversions: true, allowOmitFifth: false,
    allowExtensions: false, smoothVoiceLeading: false, maxUpperVoiceLeap: 12,
  },
  strings_quartet_basic: {
    id: "strings_quartet_basic", name: "String Quartet (Basic)",
    bassRange: [36, 50], upperRange: [55, 81], upperVoiceCount: 3,
    preferRootBass: true, allowInversions: false, allowOmitFifth: true,
    allowExtensions: false, smoothVoiceLeading: true, maxUpperVoiceLeap: 5,
  },
};
```

### Task 19: Pitch utilities

**Files:**
- Create: `src/core/voicing/pitchUtils.ts`

- [ ] **Step 1: Helpers for note-name ↔ MIDI, chord-tone extraction via Tonal `Chord`**

```ts
import { Chord, Note } from "@tonaljs/tonal";

export function noteNameToMidi(name: string): number {
  const m = Note.midi(name);
  if (m == null) throw new Error(`Invalid note: ${name}`);
  return m;
}

export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi);
}

export function getChordPitchClasses(chordSymbol: string): string[] {
  const c = Chord.get(chordSymbol);
  if (c.empty) throw new Error(`Unknown chord: ${chordSymbol}`);
  return c.notes;
}

export function pitchClassToMidiInRange(pc: string, low: number, high: number): number[] {
  const pcMidi = Note.midi(`${pc}4`)! % 12;
  const out: number[] = [];
  for (let m = low; m <= high; m++) if (m % 12 === pcMidi) out.push(m);
  return out;
}
```

### Task 20: Candidate generator

**Files:**
- Create: `src/core/voicing/generateCandidates.ts`

- [ ] **Step 1: Build root-position + first-inversion candidates**

For each chord symbol, generate up to ~6 candidates:
- Root in `bassRange`, three upper chord tones in `upperRange` (close position).
- Optional first inversion when `policy.allowInversions` (third in bass).
- Optional omit-fifth four-note voicing when `policy.allowOmitFifth`.

```ts
import type { ChordSymbol } from "../harmony/types";
import type { VoicedChord, VoicingPolicy, MidiNote } from "./types";
import { getChordPitchClasses, pitchClassToMidiInRange, noteNameToMidi } from "./pitchUtils";

export function generateCandidates(
  chordSymbol: ChordSymbol,
  roman: string,
  policy: VoicingPolicy,
): VoicedChord[] {
  const tones = getChordPitchClasses(chordSymbol);
  if (tones.length < 3) return [];
  const root = tones[0];
  const third = tones[1];
  const fifth = tones[2];
  const seventh = tones[3];

  const candidates: VoicedChord[] = [];
  const bassOptions = pitchClassToMidiInRange(root, policy.bassRange[0], policy.bassRange[1]);
  for (const bass of bassOptions) {
    candidates.push(buildClose(chordSymbol, roman, bass, [third, fifth, ...(seventh && tones.length === 4 ? [seventh] : [])], policy));
  }
  if (policy.allowInversions) {
    const thirdBass = pitchClassToMidiInRange(third, policy.bassRange[0], policy.bassRange[1]);
    for (const bass of thirdBass.slice(0, 1)) {
      candidates.push(buildClose(chordSymbol, roman, bass, [fifth, root, ...(seventh ? [seventh] : [])], policy));
    }
  }
  return candidates;
}

function buildClose(
  chordSymbol: string, roman: string, bass: MidiNote,
  upperPCs: string[], policy: VoicingPolicy,
): VoicedChord {
  const upper: MidiNote[] = [];
  let cursor = Math.max(policy.upperRange[0], bass + 7);
  for (const pc of upperPCs.slice(0, policy.upperVoiceCount)) {
    const candidates = [];
    for (let m = cursor; m <= policy.upperRange[1] + 12; m++) {
      if (m % 12 === noteNameToMidi(`${pc}4`) % 12) {
        candidates.push(m);
        if (m >= cursor) break;
      }
    }
    const choice = candidates[0] ?? cursor;
    upper.push(choice);
    cursor = choice + 1;
  }
  upper.sort((a, b) => a - b);
  return {
    chordSymbol, roman, bass,
    upperVoices: upper,
    allNotes: [bass, ...upper],
  };
}
```

### Task 21: Voice-leading scoring

**Files:**
- Create: `src/core/voicing/voiceLeading.ts`

- [ ] **Step 1: Implement `scoreVoicingCandidate(prev, cand, policy)` per spec §11.3**

```ts
import type { VoicedChord, VoicingPolicy } from "./types";

export function scoreVoicingCandidate(
  prev: VoicedChord | null,
  cand: VoicedChord,
  policy: VoicingPolicy,
): number {
  let score = 0;
  if (prev) {
    const len = Math.min(prev.upperVoices.length, cand.upperVoices.length);
    let movement = 0;
    let largeLeap = 0;
    for (let i = 0; i < len; i++) {
      const d = Math.abs(prev.upperVoices[i] - cand.upperVoices[i]);
      movement += d;
      if (d > policy.maxUpperVoiceLeap) largeLeap += d - policy.maxUpperVoiceLeap;
    }
    score += movement * 1.0 + largeLeap * 2.0;
  }
  for (const m of cand.upperVoices) {
    if (m < policy.upperRange[0] || m > policy.upperRange[1]) score += 3.0;
  }
  if (cand.bass < policy.bassRange[0] || cand.bass > policy.bassRange[1]) score += 4.0;
  // Muddy interval penalty: third or smaller below MIDI 48
  const lowestUpper = cand.upperVoices[0];
  if (cand.bass < 48 && lowestUpper - cand.bass < 5) score += 3.0;
  return score;
}
```

### Task 22: Choose-best orchestrator

**Files:**
- Create: `src/core/voicing/chooseBestVoicing.ts`, `src/core/voicing/index.ts`

- [ ] **Step 1: Implement `chooseBestVoicing(candidates, prev, policy)`**

```ts
import type { VoicedChord, VoicingPolicy } from "./types";
import { scoreVoicingCandidate } from "./voiceLeading";

export function chooseBestVoicing(
  candidates: VoicedChord[],
  prev: VoicedChord | null,
  policy: VoicingPolicy,
): VoicedChord {
  if (!candidates.length) throw new Error("No voicing candidates");
  let best = candidates[0];
  let bestScore = scoreVoicingCandidate(prev, best, policy);
  for (const c of candidates.slice(1)) {
    const s = scoreVoicingCandidate(prev, c, policy);
    if (s < bestScore) { best = c; bestScore = s; }
  }
  return best;
}
```

- [ ] **Step 2: Implement `voiceProgression(opts) → VoicedChord[]`**

```ts
// src/core/voicing/index.ts
import type { ChordSymbol, KeySignature, RomanNumeral } from "../harmony/types";
import type { InstrumentPresetId, VoicedChord } from "./types";
import { romanProgressionToChordSymbols } from "../harmony/chordSymbols";
import { generateCandidates } from "./generateCandidates";
import { chooseBestVoicing } from "./chooseBestVoicing";
import { VOICING_PRESETS } from "./presets";

export type VoicingInput = {
  key: KeySignature;
  progression: RomanNumeral[];
  instrumentPreset: InstrumentPresetId;
};

export function voiceProgression(input: VoicingInput): VoicedChord[] {
  const policy = VOICING_PRESETS[input.instrumentPreset];
  const symbols: ChordSymbol[] = romanProgressionToChordSymbols(input.progression, input.key);
  const out: VoicedChord[] = [];
  let prev: VoicedChord | null = null;
  for (let i = 0; i < symbols.length; i++) {
    const cands = generateCandidates(symbols[i], input.progression[i], policy);
    const chosen = chooseBestVoicing(cands, prev, policy);
    out.push(chosen);
    prev = chosen;
  }
  return out;
}
```

### Task 23: Instrument preset registry

**Files:**
- Create: `src/core/instruments/types.ts`, `src/core/instruments/piano.ts`, `src/core/instruments/guitar.ts`, `src/core/instruments/strings.ts`, `src/core/instruments/index.ts`

These hold sampler/MIDI metadata per preset (display name, default velocity, MIDI program number for the MIDI engine, articulation pattern). They do NOT do voicing — that's `voicing/presets.ts`.

```ts
// src/core/instruments/types.ts
import type { InstrumentPresetId } from "../voicing/types";

export type InstrumentDescriptor = {
  id: InstrumentPresetId;
  displayName: string;
  midiProgram: number; // 0..127 General MIDI
  defaultVelocity: number; // 0..127
  articulation: "block" | "arpeggio" | "strum" | "sustain";
};
```

```ts
// src/core/instruments/index.ts
import type { InstrumentPresetId } from "../voicing/types";
import type { InstrumentDescriptor } from "./types";
import { piano } from "./piano";
import { guitar } from "./guitar";
import { strings } from "./strings";

export const INSTRUMENTS: Record<InstrumentPresetId, InstrumentDescriptor> = {
  piano_clear: piano.clear,
  piano_smooth: piano.smooth,
  guitar_open: guitar.open,
  strings_quartet_basic: strings.basic,
};
```

(piano.ts/guitar.ts/strings.ts each export an object with the descriptors named above)

- [ ] **Step 3: Commit Phase 5**

```bash
git add src/core/voicing src/core/instruments
git commit -m "feat(voicing): candidates, voice-leading scoring, presets, instrument registry"
```

---

## Phase 6 — Playback Engine

### Task 24: Playback types and scheduler

**Files:**
- Create: `src/core/playback/types.ts`, `src/core/playback/scheduler.ts`

- [ ] **Step 1: Define `InstrumentEvent` (re-export from voicing/types)**

```ts
// src/core/playback/types.ts
export type { InstrumentEvent } from "../voicing/types";
```

- [ ] **Step 2: Implement `scheduleEvents(voiced, opts)`**

```ts
// src/core/playback/scheduler.ts
import type { VoicedChord, InstrumentEvent } from "../voicing/types";

export type ScheduleOptions = {
  tempoBpm: number;
  beatsPerChord?: number;
  velocity?: number;
  instrument?: string;
  articulation?: "block" | "arpeggio" | "strum" | "sustain";
};

export function scheduleEvents(
  chords: VoicedChord[],
  opts: ScheduleOptions,
): InstrumentEvent[] {
  const beats = opts.beatsPerChord ?? 4;
  const secondsPerBeat = 60 / opts.tempoBpm;
  const secondsPerChord = beats * secondsPerBeat;
  const events: InstrumentEvent[] = [];
  for (let i = 0; i < chords.length; i++) {
    events.push({
      time: i * secondsPerChord,
      duration: secondsPerChord * 0.98,
      instrument: opts.instrument ?? "default",
      notes: chords[i].allNotes,
      velocity: opts.velocity ?? 90,
      articulation: opts.articulation ?? "block",
    });
  }
  return events;
}
```

### Task 25: Tone.js sampler engine

**Files:**
- Create: `src/core/playback/toneEngine.ts`

- [ ] **Step 1: Implement `initAudio`, `playEvents`, `playChord`, `stop`, `setTempo`**

Use `Tone.Sampler` with Salamander Grand Piano, plus `Tone.Reverb`. Lazy-init sampler on first `playEvents`. `stop()` disposes both sampler and reverb (spec §12.2 — `releaseAll()` cannot cancel scheduled future events).

```ts
import * as Tone from "tone";
import type { InstrumentEvent } from "../voicing/types";
import type { InstrumentPresetId } from "../voicing/types";

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let initialized = false;
let tempo = 100;

const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";
const SAMPLES = {
  A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3",
};

export async function initAudio(): Promise<void> {
  if (initialized) return;
  await Tone.start();
  initialized = true;
}

function getSampler(): Tone.Sampler {
  if (sampler && reverb) return sampler;
  reverb = new Tone.Reverb({ decay: 2.0, wet: 0.2 }).toDestination();
  sampler = new Tone.Sampler({ urls: SAMPLES, baseUrl: SALAMANDER_BASE }).connect(reverb);
  return sampler;
}

export async function playEvents(events: InstrumentEvent[], _preset: InstrumentPresetId): Promise<void> {
  await initAudio();
  const s = getSampler();
  await Tone.loaded();
  const now = Tone.now() + 0.05;
  for (const ev of events) {
    const noteNames = ev.notes.map((m) => Tone.Frequency(m, "midi").toNote());
    s.triggerAttackRelease(noteNames, ev.duration, now + ev.time, ev.velocity / 127);
  }
}

export async function playChord(notes: number[], duration: number, _preset: InstrumentPresetId, velocity = 90): Promise<void> {
  await initAudio();
  const s = getSampler();
  await Tone.loaded();
  const noteNames = notes.map((m) => Tone.Frequency(m, "midi").toNote());
  s.triggerAttackRelease(noteNames, duration, Tone.now() + 0.05, velocity / 127);
}

export function stop(): void {
  if (sampler) { sampler.dispose(); sampler = null; }
  if (reverb) { reverb.dispose(); reverb = null; }
}

export function setTempo(bpm: number): void { tempo = bpm; Tone.Transport.bpm.value = bpm; }
export function getTempo(): number { return tempo; }
export function dispose(): void { stop(); }
```

### Task 26: Web MIDI engine

**Files:**
- Create: `src/core/playback/midiEngine.ts`

- [ ] **Step 1: Implement requestMidiAccess, output selection, playEvents, playChord, stop**

```ts
import type { InstrumentEvent } from "../voicing/types";

let access: MIDIAccess | null = null;
let outputId: string | null = null;
let scheduledTimeouts: number[] = [];

export async function requestMidiAccess(): Promise<MIDIAccess> {
  if (access) return access;
  access = await navigator.requestMIDIAccess({ sysex: false });
  return access;
}

export function getMidiOutputs(): MIDIOutput[] {
  if (!access) return [];
  return Array.from(access.outputs.values());
}

export function setMidiOutput(id: string): void { outputId = id; }

function output(): MIDIOutput | null {
  if (!access || !outputId) return null;
  return access.outputs.get(outputId) ?? null;
}

export async function playEvents(events: InstrumentEvent[], _preset?: string): Promise<void> {
  const out = output();
  if (!out) return;
  const start = performance.now() + 50;
  for (const ev of events) {
    const onTime = start + ev.time * 1000;
    const offTime = onTime + ev.duration * 1000;
    for (const note of ev.notes) {
      out.send([0x90, note, ev.velocity], onTime);
      out.send([0x80, note, 0], offTime);
    }
  }
}

export async function playChord(notes: number[], duration: number, _preset?: string, velocity = 90): Promise<void> {
  const out = output();
  if (!out) return;
  const now = performance.now() + 20;
  for (const n of notes) {
    out.send([0x90, n, velocity], now);
    out.send([0x80, n, 0], now + duration * 1000);
  }
}

export function stop(): void {
  const out = output();
  if (!out) return;
  for (let ch = 0; ch < 16; ch++) {
    out.send([0xb0 + ch, 123, 0]); // All Notes Off
  }
  if ("clear" in out && typeof (out as MIDIOutput & { clear?: () => void }).clear === "function") {
    (out as MIDIOutput & { clear: () => void }).clear();
  }
  for (const id of scheduledTimeouts) clearTimeout(id);
  scheduledTimeouts = [];
}

export function dispose(): void { stop(); access = null; outputId = null; }
```

- [ ] **Step 2: Commit Phase 6**

```bash
git add src/core/playback
git commit -m "feat(playback): scheduler + Tone.js sampler engine + Web MIDI engine"
```

---

## Phase 7 — AI Stub

### Task 27: AI placeholder

**Files:**
- Create: `src/core/ai/types.ts`, `src/core/ai/localProvider.ts`, `src/core/ai/README.md`

- [ ] **Step 1: Define provider interface**

```ts
// types.ts
import type { ProgressionTemplate } from "../progressions/types";

export type AIGenerationRequest = {
  mode: "major" | "minor";
  difficulty: 1 | 2 | 3 | 4 | 5;
  count: number;
  promptHint?: string;
};

export type AIGenerationResult = {
  candidates: Omit<ProgressionTemplate, "id">[];
};

export interface ProgressionAIProvider {
  generate(req: AIGenerationRequest): Promise<AIGenerationResult>;
}
```

- [ ] **Step 2: Stub local provider that throws**

```ts
// localProvider.ts
import type { AIGenerationRequest, AIGenerationResult, ProgressionAIProvider } from "./types";

export class LocalAIStubProvider implements ProgressionAIProvider {
  async generate(_req: AIGenerationRequest): Promise<AIGenerationResult> {
    throw new Error("AI generation not implemented yet — only stub provider available.");
  }
}
```

- [ ] **Step 3: README explaining future flow** (spec §5.4): generation → JSON → validator → normalize → save. LLM output never bypasses validator.

---

## Phase 8 — UI Layer

### Task 28: Entry point + global styles

**Files:**
- Create: `src/app/main.tsx`, `src/app/styles.css`

- [ ] **Step 1: `main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: `styles.css`**

Plain CSS with `:root` variables (`--accent`, `--bg`, `--surface`, `--text`), grid layout for trainer page, `.chord-block`, `.chord-block.clickable:hover { color: var(--accent) }`, `.chord-block.hidden-progression { filter: blur(4px); pointer-events: none; }`, feedback panel styles (correct = green, wrong = red), tabbed nav for Trainer/Library/Debug.

### Task 29: App shell with three pages

**Files:**
- Create: `src/app/App.tsx`

- [ ] **Step 1: `App.tsx` outline**

State per spec §14. Three pages selected via `view: "trainer" | "library" | "debug"` state.

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Mode } from "../core/harmony/types";
import { getDefaultVocabulary, MAJOR_KEYS, MINOR_KEYS } from "../core/harmony/keys";
import type { ExerciseType, ExerciseGenerationOptions, Exercise } from "../core/exercises/types";
import { generateExercise } from "../core/exercises/generateExercise";
import { scoreAnswer } from "../core/exercises/scoring";
import type { InstrumentPresetId, VoicedChord, InstrumentEvent } from "../core/voicing/types";
import { voiceProgression } from "../core/voicing";
import { scheduleEvents } from "../core/playback/scheduler";
import * as toneEngine from "../core/playback/toneEngine";
import * as midiEngine from "../core/playback/midiEngine";
import { getAllProgressions } from "../core/progressions";

type View = "trainer" | "library" | "debug";

export function App() {
  const [view, setView] = useState<View>("trainer");
  const [mode, setMode] = useState<Mode>("major");
  const [tonic, setTonic] = useState<string>("C");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("identify_progression");
  const [presetId, setPresetId] = useState<InstrumentPresetId>("piano_clear");
  const [groupId, setGroupId] = useState<string>("all");
  const [difficultyMin, setDifficultyMin] = useState<number>(1);
  const [difficultyMax, setDifficultyMax] = useState<number>(3);
  const [tempo, setTempo] = useState<number>(100);
  const [choiceCount, setChoiceCount] = useState<number>(4);
  const [showRoman, setShowRoman] = useState<boolean>(false);
  const [soundEngine, setSoundEngine] = useState<"sampler" | "midi">("sampler");
  const [midiOutputs, setMidiOutputs] = useState<{ id: string; name: string }[]>([]);
  const [midiOutputId, setMidiOutputId] = useState<string | null>(null);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [voicedChords, setVoicedChords] = useState<VoicedChord[]>([]);
  const [events, setEvents] = useState<InstrumentEvent[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const allowedRomans = useMemo(() => getDefaultVocabulary(mode), [mode]);
  const availableTonics = mode === "major" ? MAJOR_KEYS : MINOR_KEYS;

  useEffect(() => {
    if (soundEngine !== "midi") return;
    midiEngine.requestMidiAccess().then(() => {
      const outs = midiEngine.getMidiOutputs().map((o) => ({ id: o.id, name: o.name ?? o.id }));
      setMidiOutputs(outs);
      if (outs[0] && !midiOutputId) {
        setMidiOutputId(outs[0].id);
        midiEngine.setMidiOutput(outs[0].id);
      }
    }).catch(() => setMidiOutputs([]));
  }, [soundEngine, midiOutputId]);

  const handleGenerateExercise = useCallback(() => {
    const opts: ExerciseGenerationOptions = {
      key: { tonic, mode },
      allowedRomans,
      exerciseType,
      difficultyRange: [difficultyMin, difficultyMax],
      groupId,
      instrumentPreset: presetId,
      choiceCount,
    };
    const ex = generateExercise(opts);
    if (!ex) {
      setExercise(null); setVoicedChords([]); setEvents([]);
      setFeedback({ correct: false, explanation: "No matching progression for these settings." });
      return;
    }
    const voiced = voiceProgression({ key: ex.key, progression: ex.originalProgression, instrumentPreset: presetId });
    const evs = scheduleEvents(voiced, { tempoBpm: tempo });
    setExercise(ex);
    setVoicedChords(voiced);
    setEvents(evs);
    setSelectedChoiceId(null);
    setFeedback(null);
  }, [tonic, mode, allowedRomans, exerciseType, difficultyMin, difficultyMax, groupId, presetId, choiceCount, tempo]);

  const handlePlay = useCallback(async () => {
    if (!events.length) return;
    setIsPlaying(true);
    const eng = soundEngine === "midi" ? midiEngine : toneEngine;
    try { await eng.playEvents(events, presetId); }
    finally {
      const total = events.reduce((acc, e) => Math.max(acc, e.time + e.duration), 0);
      setTimeout(() => setIsPlaying(false), total * 1000 + 200);
    }
  }, [events, soundEngine, presetId]);

  const handleStop = useCallback(() => {
    toneEngine.stop(); midiEngine.stop(); setIsPlaying(false);
  }, []);

  const handlePlayChord = useCallback(async (i: number) => {
    if (!voicedChords[i]) return;
    const eng = soundEngine === "midi" ? midiEngine : toneEngine;
    eng.stop();
    const beat = 60 / tempo;
    await eng.playChord(voicedChords[i].allNotes, beat * 2, presetId, 90);
  }, [voicedChords, soundEngine, presetId, tempo]);

  const handleSubmitAnswer = useCallback(() => {
    if (!exercise || !selectedChoiceId) return;
    const result = scoreAnswer(exercise, selectedChoiceId);
    setFeedback(result);
    setScore((s) => ({ correct: s.correct + (result.correct ? 1 : 0), total: s.total + 1 }));
  }, [exercise, selectedChoiceId]);

  // === Render ===
  return (
    <div className="app">
      <nav className="topnav">
        <button className={view === "trainer" ? "active" : ""} onClick={() => setView("trainer")}>Trainer</button>
        <button className={view === "library" ? "active" : ""} onClick={() => setView("library")}>Library</button>
        <button className={view === "debug" ? "active" : ""} onClick={() => setView("debug")}>Debug</button>
      </nav>
      {view === "trainer" && (
        <TrainerPage {...{ mode, setMode, tonic, setTonic, availableTonics, exerciseType, setExerciseType,
          presetId, setPresetId, groupId, setGroupId, difficultyMin, setDifficultyMin,
          difficultyMax, setDifficultyMax, tempo, setTempo, choiceCount, setChoiceCount,
          showRoman, setShowRoman, soundEngine, setSoundEngine, midiOutputs, midiOutputId,
          setMidiOutputId, exercise, voicedChords, selectedChoiceId, setSelectedChoiceId,
          feedback, score, isPlaying, handleGenerateExercise, handlePlay, handleStop,
          handlePlayChord, handleSubmitAnswer }} />
      )}
      {view === "library" && <LibraryPage />}
      {view === "debug" && <DebugPage exercise={exercise} voicedChords={voicedChords} events={events} />}
    </div>
  );
}

// TrainerPage, LibraryPage, DebugPage are defined as inline function components below.
```

- [ ] **Step 2: Implement `TrainerPage`** — settings panel grid (selects, sliders, range inputs), exercise panel with chord blocks (`.chord-block.hidden-progression` when `!showRoman`), Play/Stop buttons (disabled while playing), choices list with radio behavior, Submit button, feedback box, score readout.

- [ ] **Step 3: Implement `LibraryPage`** — uses `getAllProgressions()`, filters by mode and tag dropdowns, renders cards with name, roman, description, difficulty stars, tag chips.

- [ ] **Step 4: Implement `DebugPage`** — `<pre>{JSON.stringify({exercise, voicedChords, events}, null, 2)}</pre>` plus a copy button.

- [ ] **Step 5: Commit Phase 8**

```bash
git add src/app
git commit -m "feat(ui): TrainerPage, LibraryPage, DebugPage with sampler+MIDI playback"
```

---

## Phase 9 — Tests

### Task 30: harmony.test.ts (spec §15.1)

**Files:**
- Create: `src/tests/harmony.test.ts`

- [ ] **Step 1: Test cases**

```ts
import { describe, expect, test } from "vitest";
import { romanToChordSymbol, romanProgressionToChordSymbols } from "../core/harmony/chordSymbols";
import { getFunctionGroup } from "../core/harmony/functionGroups";

describe("Roman → Chord symbol", () => {
  test("C major: I → C", () => expect(romanToChordSymbol("I", { tonic: "C", mode: "major" })).toBe("C"));
  test("C major: vi → Am", () => expect(romanToChordSymbol("vi", { tonic: "C", mode: "major" })).toBe("Am"));
  test("D major: I → D", () => expect(romanToChordSymbol("I", { tonic: "D", mode: "major" })).toBe("D"));
  test("D major: vi → Bm", () => expect(romanToChordSymbol("vi", { tonic: "D", mode: "major" })).toBe("Bm"));
  test("A minor: i → Am", () => expect(romanToChordSymbol("i", { tonic: "A", mode: "minor" })).toBe("Am"));
  test("A minor: V → E (harmonic minor)", () => expect(romanToChordSymbol("V", { tonic: "A", mode: "minor" })).toBe("E"));
  test("A minor: V7 → E7", () => expect(romanToChordSymbol("V7", { tonic: "A", mode: "minor" })).toBe("E7"));

  test("Progression: C major I-vi-IV-V → C-Am-F-G", () => {
    expect(romanProgressionToChordSymbols(["I","vi","IV","V"], { tonic: "C", mode: "major" }))
      .toEqual(["C","Am","F","G"]);
  });
});

describe("Function group", () => {
  test("Major: V is D", () => expect(getFunctionGroup("V", "major")).toBe("D"));
  test("Major: ii is PD", () => expect(getFunctionGroup("ii", "major")).toBe("PD"));
  test("Minor: i is T", () => expect(getFunctionGroup("i", "minor")).toBe("T"));
});
```

### Task 31: progressionValidation.test.ts (spec §15.2)

**Files:**
- Create: `src/tests/progressionValidation.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, expect, test } from "vitest";
import { getAllProgressions } from "../core/progressions";
import { validateProgressionTemplate } from "../core/harmony/validateProgression";

describe("All progressions valid", () => {
  for (const p of getAllProgressions()) {
    test(`${p.id} - ${p.name}`, () => {
      const r = validateProgressionTemplate(p);
      if (!r.ok) throw new Error(r.errors.join(", "));
      expect(p.id).toBeTruthy();
      expect(p.roman.length).toBeGreaterThan(0);
      expect(p.functions.length).toBe(p.roman.length);
      expect(p.difficulty).toBeGreaterThanOrEqual(1);
      expect(p.difficulty).toBeLessThanOrEqual(5);
    });
  }
});
```

### Task 32: exerciseGeneration.test.ts (spec §15.3)

**Files:**
- Create: `src/tests/exerciseGeneration.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, expect, test } from "vitest";
import { generateExercise } from "../core/exercises/generateExercise";
import { getDefaultVocabulary } from "../core/harmony/keys";

const baseOpts = {
  key: { tonic: "C", mode: "major" as const },
  allowedRomans: getDefaultVocabulary("major"),
  difficultyRange: [1, 5] as [number, number],
  groupId: "all",
  instrumentPreset: "piano_clear" as const,
  choiceCount: 4,
};

describe("Exercise generation", () => {
  test("identify_progression generates exercise with answer in choices", () => {
    const ex = generateExercise({ ...baseOpts, exerciseType: "identify_progression" });
    expect(ex).toBeTruthy();
    if (!ex) return;
    expect(ex.choices.find((c) => c.id === ex.answerId)).toBeTruthy();
    expect(ex.choices.length).toBeLessThanOrEqual(4);
  });

  test("fill_missing_chord has targetIndex and one null in promptProgression", () => {
    const ex = generateExercise({ ...baseOpts, exerciseType: "fill_missing_chord" });
    expect(ex?.targetIndex).toBeTypeOf("number");
    expect(ex?.promptProgression?.filter((x) => x === null).length).toBe(1);
  });

  test("detect_replacement targetIndex within range", () => {
    const ex = generateExercise({ ...baseOpts, exerciseType: "detect_replacement" });
    if (!ex) return;
    expect(ex.targetIndex).toBeGreaterThanOrEqual(0);
    expect(ex.targetIndex!).toBeLessThan(ex.originalProgression.length);
  });
});
```

### Task 33: voicing.test.ts (spec §15.4)

**Files:**
- Create: `src/tests/voicing.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, expect, test } from "vitest";
import { voiceProgression } from "../core/voicing";

describe("Voicing engine", () => {
  test("Generates notes for I-vi-IV-V in C major piano_clear", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi", "IV", "V"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced.length).toBe(4);
    for (const v of voiced) {
      expect(v.allNotes.length).toBeGreaterThanOrEqual(4);
      expect(v.bass).toBeGreaterThanOrEqual(36);
      expect(v.bass).toBeLessThanOrEqual(50);
      for (const u of v.upperVoices) {
        expect(u).toBeGreaterThanOrEqual(50);
        expect(u).toBeLessThanOrEqual(84);
      }
    }
  });

  test("Bass is root of chord in piano_clear", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced[0].bass % 12).toBe(0); // C
  });

  test("Voice leading: C → Am keeps small upper-voice movement", () => {
    const v = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi"],
      instrumentPreset: "piano_clear",
    });
    let totalMove = 0;
    for (let i = 0; i < Math.min(v[0].upperVoices.length, v[1].upperVoices.length); i++) {
      totalMove += Math.abs(v[0].upperVoices[i] - v[1].upperVoices[i]);
    }
    expect(totalMove).toBeLessThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run all tests and commit**

```bash
npm run test
git add src/tests
git commit -m "test: add core harmony / progression / exercise / voicing suites"
```

---

## Phase 10 — Documentation

### Task 34: README.md (spec §5.1)

**Files:**
- Create: `README.md`

Sections: Project description (use spec §22 quote), Quick start (`npm install && npm run dev`), Supported features (24 keys, 3 exercise types, 4 presets, 2 sound engines), Practice types description, Tech stack list, FAQ (browser audio permissions, MIDI port setup, sampler download).

### Task 35: AGENT_GUIDE.md (spec §5.2)

**Files:**
- Create: `AGENT_GUIDE.md`

Sections: Architecture summary, Design boundaries (don't import voicing into harmony, etc. — spec §21), How to add a progression, How to add an instrument preset, How to add an exercise type, How to add an AI generator, Test commands, Common pitfalls (Tone.js needs user gesture for audio start; Web MIDI needs HTTPS or localhost; Salamander samples download on first play).

### Task 36: PROJECT_MAP.md (spec §5.3)

**Files:**
- Create: `PROJECT_MAP.md`

Sections: Directory tree with one-line responsibility per folder, Key files description, Data flow diagram (the flow from spec §5.3), Sample call chain.

### Task 37: docs/ARCHITECTURE.md, docs/MUSIC_THEORY_NOTES.md, public/samples/README.md, src/data/README.md

**Files:**
- Create: `docs/ARCHITECTURE.md`, `docs/MUSIC_THEORY_NOTES.md`, `public/samples/README.md`, `src/core/ai/README.md` (already done in Task 27)

ARCHITECTURE.md: layer diagram + data flow expanded.
MUSIC_THEORY_NOTES.md: Notes on harmonic minor handling, function-group choices, jazz chord notation conventions, where Tonal.js is queried.
public/samples/README.md: explains samples are streamed from `tonejs.github.io/audio/salamander/` — no local files needed.

- [ ] **Step 1: Commit docs**

```bash
git add README.md AGENT_GUIDE.md PROJECT_MAP.md docs/ARCHITECTURE.md docs/MUSIC_THEORY_NOTES.md public/samples/README.md src/core/ai/README.md
git commit -m "docs: README, agent guide, project map, architecture, music-theory notes"
```

---

## Phase 11 — Verification

### Task 38: End-to-end smoke

- [ ] **Step 1: `npm run lint`** — TypeScript strict pass
- [ ] **Step 2: `npm run test`** — all suites pass
- [ ] **Step 3: `npm run build`** — production bundle builds
- [ ] **Step 4: `npm run dev`** — manual smoke (user verifies in browser)

If any of 1–3 fail: fix, re-run, do NOT commit failing artifacts. Document any flaky behavior in AGENT_GUIDE.md "Known issues".

---

## Self-Review Checklist (verify before declaring done)

- [ ] Spec §6 types appear verbatim in `src/core/harmony/types.ts`, `src/core/progressions/types.ts`, `src/core/exercises/types.ts`, `src/core/voicing/types.ts`.
- [ ] Spec §7 — 72 progressions exist (25 + 18 + 17 + 12).
- [ ] Spec §8 — 24 keys (12 major + 12 minor) selectable.
- [ ] Spec §9 — three exercise types implemented; two stubbed.
- [ ] Spec §10 — `validateProgressionTemplate` is run by `progressionValidation.test.ts` for every progression.
- [ ] Spec §11 — four voicing presets exist with distinct policies.
- [ ] Spec §12 — Sampler engine and MIDI engine both have `playEvents`, `playChord`, `stop`. `stop()` disposes the sampler.
- [ ] Spec §13 — TrainerPage has Show/Hide Progression toggle, clickable chord blocks, Play/Stop, choices, Submit, feedback, score.
- [ ] Spec §15 — All four test files exist with the listed cases.
- [ ] No file in `src/core/harmony/` imports from `voicing/`, `playback/`, or `app/`.
- [ ] `src/core/ai/` exists with stub provider and README.
