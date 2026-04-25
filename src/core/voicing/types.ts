import { ChordSymbol, RomanNumeralSymbol } from "../harmony/types";

export type MidiNote = number;

export interface VoicedChord {
  chordSymbol: ChordSymbol;
  roman: RomanNumeralSymbol;
  bass: MidiNote;
  upperVoices: MidiNote[];
  allNotes: MidiNote[];
}

export interface VoicingPolicy {
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
}

export interface VoicedProgressionInput {
  romanProgression: RomanNumeralSymbol[];
  chordSymbols: ChordSymbol[];
  previousVoicing: VoicedChord | null;
  policy: VoicingPolicy;
}

export interface VoicingCandidate {
  bass: MidiNote;
  upperVoices: MidiNote[];
}
