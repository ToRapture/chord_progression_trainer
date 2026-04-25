# Music Theory Notes

Brief reference for the music theory concepts used in this project.

## Roman Numeral Notation

Roman numerals represent chords relative to a key's scale degrees:

| Roman | Major Key (C) | Minor Key (A) | Function |
|-------|--------------|--------------|----------|
| I / i | C / Am       | Am / Am      | Tonic    |
| ii / ii° | Dm       | B°           | Predominant |
| iii / III | Em      | C            | Tonic    |
| IV / iv | F / Dm      | Dm / Dm      | Predominant |
| V / v   | G / Em      | E / Em       | Dominant |
| vi / VI | Am / F      | F / F        | Tonic    |
| vii° / VII | B° / G  | G#° / G      | Dominant |

### Case Conventions
- **UPPERCASE**: Major chords (I, IV, V, etc.)
- **lowercase**: Minor chords (ii, iii, vi, etc.)
- **° or dim**: Diminished chords (vii°, ii°)
- **7**: Seventh chords (V7, ii7, Imaj7)

## Diatonic Chords in Major

| Degree | Roman | Chord | Quality  | Notes in C |
|--------|-------|-------|----------|------------|
| 1      | I     | C     | Major    | C E G      |
| 2      | ii    | Dm    | Minor    | D F A      |
| 3      | iii   | Em    | Minor    | E G B      |
| 4      | IV    | F     | Major    | F A C      |
| 5      | V     | G     | Major    | G B D      |
| 6      | vi    | Am    | Minor    | A C E      |
| 7      | vii°  | B°    | Dim      | B D F      |

## Diatonic Chords in Natural Minor

| Degree | Roman | Chord | Quality  | Notes in Am |
|--------|-------|-------|----------|-------------|
| 1      | i     | Am    | Minor    | A C E       |
| 2      | ii°   | B°    | Dim      | B D F       |
| 3      | III   | C     | Major    | C E G       |
| 4      | iv    | Dm    | Minor    | D F A       |
| 5      | v     | Em    | Minor    | E G B       |
| 6      | VI    | F     | Major    | F A C       |
| 7      | VII   | G     | Major    | G B D       |

## Harmonic Minor

The harmonic minor raises the 7th scale degree, creating a leading tone:

| Degree | Roman | Chord | Quality  | Notes in Am |
|--------|-------|-------|----------|-------------|
| 5      | V     | E     | Major    | E G# B      |
| 7      | vii°  | G#°   | Dim      | G# B D      |

V and vii° from harmonic minor provide stronger dominant function.

## T / PD / D Function Groups

Function groups classify chords by their harmonic role:

### Tonic (T) — Stability, rest, home
- Major: I, iii, vi
- Minor: i, III, VI

### Predominant (PD) — Preparation, movement away from tonic
- Major: ii, IV
- Minor: ii°, iv

### Dominant (D) — Tension, pull toward tonic
- Major: V, V7, vii°
- Minor: V, V7, VII, vii°

## Why Separate Bass and Upper Voices

In ear training, the bass line is the most important cue for identifying chord progressions:

1. **Bass carries the scale degree** — The bass note often indicates the chord's root (degree 1=root of I, degree 4=root of IV, degree 5=root of V).
2. **Beginners hear bass first** — A clear, separated bass helps learners identify the harmonic foundation.
3. **Muddy bass = confusion** — If chord tones are clustered in the low register, harmonic function becomes unclear.

In this project:
- `piano_clear`: Bass in C2-C3, upper voices in C4-E5 — clear separation
- `piano_smooth`: More blended, but still maintains bass distinction

## Why Voice Leading Makes C → Am More Natural

Without voice leading, a mechanical root-position voicing of C → Am might look like:

```
C:  C3 E3 G3 C4 E4 G4
Am: A2 A3 C4 E4 A4 C5
```

With voice leading (retain common tones when possible):

```
C:  C2 + [E4, G4, C5]
Am: A2 + [E4, A4, C5]    ← E and C are common tones, retained in place
```

Benefits:
1. Smoother sound — less jarring jumps between chords
2. More musical — sounds like a real pianist, not a computer
3. Retains common tones — notes shared between chords stay in the same register

The `keepCommonTones` function in `voiceLeading.ts` checks if pitch classes are shared between consecutive chords.

## Beginner Training vs Musical Voicing

### Beginner Training (piano_clear)
- Root position (bass = chord root)
- Wide separation between bass and upper voices
- No inversions, no extensions
- Clear, block-chord articulation
- **Goal**: Make the harmonic structure obvious

### Musical Voicing (piano_smooth)
- May use inversions (bass ≠ root sometimes)
- Smooth voice leading between chords
- May omit the fifth (least important tone)
- More natural articulation
- **Goal**: Natural-sounding progression while still clear

## Common Confusion Pairs

Some chords are commonly confused because they share tones or functions:

| Pair | Why Confused |
|------|-------------|
| IV ↔ ii | Both predominant, share F-A in C major |
| vi ↔ iii | Both tonic substitutes in major |
| V ↔ vii° | Both dominant function in major |
| I ↔ vi | Share C-E in C major (relative major/minor) |
| iv ↔ ii° | Both predominant in minor |

The distractor generator uses these pairs to create plausible wrong answers.
