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
