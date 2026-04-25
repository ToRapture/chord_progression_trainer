export type Mode = "major" | "minor";

export type HarmonicFunction = "T" | "PD" | "D";

export type RomanNumeralSymbol = string;

export type ChordSymbol = string;

export type NoteName = string;

export type PitchClass = string;

export type ScaleDegree = number;

export interface MusicalKey {
  tonic: NoteName;
  mode: Mode;
}

export type ChordSource =
  | "diatonic"
  | "harmonic_minor"
  | "melodic_minor"
  | "borrowed"
  | "secondary_dominant"
  | "custom";

export interface ChordInKey {
  roman: RomanNumeralSymbol;
  symbol: ChordSymbol;
  functionGroup: HarmonicFunction;
  scaleDegree: ScaleDegree;
  chordTones: PitchClass[];
  source: ChordSource;
}

export type Difficulty = 1 | 2 | 3 | 4 | 5;
