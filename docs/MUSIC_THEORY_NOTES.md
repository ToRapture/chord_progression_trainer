# MUSIC_THEORY_NOTES

How this project resolves a few non-trivial harmony decisions. The goal is consistency with how popular and tonal music is actually written, not strict adherence to any single textbook.

## Roman numerals supported

Default vocab (`getDefaultVocabulary`):

- **Major**: `I ii iii IV V V7 vi vii°`
- **Minor**: `i ii° III iv v V V7 VI VII vii°`

Extended vocab adds 7th-chord variants (`Imaj7`, `ii7`, `viiø7`, ...) and modal mixture (`bVI`, `bVII`).

The parser (`src/core/harmony/roman.ts`) understands:
- Case → triad quality (`I` major, `i` minor)
- `°` → diminished, `ø` → half-diminished
- `7` → dominant 7, `maj7` → major 7, `ø7` → half-dim 7, `°7` (or `dim7`) → fully diminished
- Leading `b` → flat-degree (e.g. `bVII`)

Augmented and secondary-dominant notation (`V/V`) are not in the default parser; templates that need them either spell the resulting chord directly or use the borrowed-degree spelling (`bVII` etc.).

## The harmonic-minor lift

In a strict natural minor scale, the chord on degree 5 is minor (e.g. v in A minor = E minor) and the chord on degree 7 is major (VII = G major). Almost no real minor-key music functions that way at cadence points — you want the major V (with its leading tone) and the diminished vii°.

`romanToChordSymbol` handles this with two specific lifts:

1. **`V` / `V7` in minor mode** — the parser sets `quality: "major"` regardless of mode, so `V` in A minor resolves to `E` (not `Em`) and `V7` resolves to `E7`. The diatonic root `E` doesn't need transposition.

2. **`vii°` in minor mode** — the natural-minor 7th degree is a whole step below the tonic (G in A minor). To get the leading-tone diminished chord, we raise it a chromatic step: `vii°` in A minor → `G#dim`, not `Gdim`. Implemented as `Note.transpose(root, "1A")` (augmented unison up) when `mode==="minor" && degree===7 && quality==="diminished"`.

The natural minor `VII` (e.g. `G` in A minor) is preserved when explicitly requested — this gives you the modal-rock VII for templates that want it.

## Function groups (T / PD / D / OTHER)

A simplified Riemannian classification: tonic, predominant, dominant, other. Used for explanations and for some difficulty heuristics.

- **Major**: T = `{I, iii, vi, ...}`, PD = `{ii, IV, ...}`, D = `{V, V7, vii°, ...}`
- **Minor**: T = `{i, III, VI, ...}`, PD = `{ii°, iv, bVI}`, D = `{v, V, V7, VII, vii°, bVII}`

Both `v` (natural-minor dominant) and `V` (harmonic-minor dominant) are classified as D, even though they pull differently. Both `VII` and `vii°` likewise — context makes the distinction.

Anything not in those tables is `OTHER`. This includes secondary dominants and uncommon mixture chords; treat that as a TODO if you start using them often.

## Voicing strategy

The voicing engine never tries to be "the right answer" — it generates a set of candidates and picks the lowest-scoring one against the previous chord. Scoring (`voiceLeading.ts`) penalizes:

- Total upper-voice movement vs. previous chord (the dominant cost)
- Any single voice leap larger than `maxUpperVoiceLeap` semitones (preset-dependent)
- Notes outside `upperRange`
- "Muddy low" intervals — a third or smaller between two voices when the lower one is below MIDI 48 (≈C3). These sound muddy on piano.
- Wide gaps (>12 semitones) between adjacent upper voices

Candidates per chord come from:

- Each available bass MIDI in the bass range (root only by default; third also if `allowInversions`)
- Each rotation of the upper-voice pitch-class ordering (close-position inversions)
- An "omit fifth" variant for 7th chords if the policy allows it

For `piano_clear`, this gives ~9 candidates per chord; the scorer picks the smoothest.

## Why the test asserts movement ≤ 8 for C → Am

C major triad in close root position around middle C is roughly `[C4, E4, G4, C5]`. The smoothest A minor neighbor is `[C4, E4, A4]` (or `[C4, E4, A4, C5]`) — A4 is just two semitones up from G4, and the rest is common-tone. Total upper-voice movement is then 2-3 semitones, well under 8. If the test fails with movement = 10, the candidate generator wasn't producing inversions and the scorer had to take whatever single root-position layout was emitted.

## What's intentionally simple

- **No proper notation of secondary dominants.** `V/V` would be parseable but doesn't exist in any current template; templates that need it spell the resulting major triad (`II` doesn't roll off the parser's tongue, but `V` of `V` written as a borrowed major triad does).
- **Rhythm is fixed** at one chord per 4 beats. The scheduler exposes `beatsPerChord` for future use.
- **No modulation between chords.** Every progression is in a single key. The whole `KeySignature` is passed into the voicing engine fresh per call.
- **Equal temperament** — every pitch is just `MIDI % 12`. No microtuning, no enharmonic spelling concerns past pitch class.
