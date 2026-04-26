import type { ChordSymbol, RomanNumeral } from "../harmony/types";

export type MidiNote = number;

export type VoicedChord = {
  chordSymbol: ChordSymbol;
  roman: RomanNumeral;
  bass: MidiNote;
  upperVoices: MidiNote[];
  allNotes: MidiNote[];
};

export type VoicingPolicy = {
  id: string;
  name: string;
  bassRange: [MidiNote, MidiNote];
  upperRange: [MidiNote, MidiNote];
  upperVoiceCount: number;
  preferRootBass: boolean;
  allowInversions: boolean;
  allowOmitFifth: boolean;
  allowExtensions: boolean;
  smoothVoiceLeading: boolean;
  maxUpperVoiceLeap: number;
};

export type InstrumentPresetId =
  | "piano_clear"
  | "piano_smooth"
  | "guitar_open"
  | "strings_quartet_basic";

export type InstrumentEvent = {
  time: number;
  duration: number;
  instrument: string;
  notes: MidiNote[];
  velocity: number;
  articulation?: "block" | "arpeggio" | "strum" | "sustain";
};
