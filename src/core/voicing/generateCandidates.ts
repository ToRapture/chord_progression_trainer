import { Chord, Note } from "@tonaljs/tonal";
import { getChordPitchClasses, getChordRoot } from "../harmony/chordSymbols";
import type { RomanNumeral } from "../harmony/types";
import type { VoicedChord, VoicingPolicy } from "./types";
import { pitchClassToMidiInRange } from "./pitchUtils";

const GUITAR_SHAPES: Record<string, string[]> = {
  C: ["C3", "E3", "G3", "C4", "E4"],
  G: ["G2", "B2", "D3", "G3", "B3", "G4"],
  Am: ["A2", "E3", "A3", "C4", "E4"],
  Em: ["E2", "B2", "E3", "G3", "B3", "E4"],
  F: ["F2", "C3", "F3", "A3", "C4", "F4"],
  Dm: ["D3", "A3", "D4", "F4"],
  D: ["D3", "A3", "D4", "F#4"],
  E: ["E2", "B2", "E3", "G#3", "B3", "E4"],
  A: ["A2", "E3", "A3", "C#4", "E4"],
};

function notesToMidi(notes: string[]): number[] {
  return notes.map((note) => Note.midi(note)).filter((midi): midi is number => midi != null);
}

function upperVoicesForPitchClasses(pitchClasses: string[], policy: VoicingPolicy, rotation = 0): number[] {
  const selected = [...pitchClasses.slice(rotation), ...pitchClasses.slice(0, rotation)];
  const voices: number[] = [];
  for (let i = 0; voices.length < policy.upperVoiceCount && i < selected.length * 3; i += 1) {
    const pc = selected[i % selected.length];
    const midi = pitchClassToMidiInRange(pc, policy.upperRange, false);
    const shifted = midi + 12 * Math.floor(i / selected.length);
    if (shifted <= policy.upperRange[1]) voices.push(shifted);
  }
  return voices.sort((a, b) => a - b).slice(0, policy.upperVoiceCount);
}

export function generateVoicingCandidates(chordSymbol: string, roman: RomanNumeral, policy: VoicingPolicy): VoicedChord[] {
  if (policy.id === "guitar_open" && GUITAR_SHAPES[chordSymbol]) {
    const allNotes = notesToMidi(GUITAR_SHAPES[chordSymbol]);
    return [{ chordSymbol, roman, bass: allNotes[0], upperVoices: allNotes.slice(1), allNotes }];
  }

  const chord = Chord.get(chordSymbol);
  if (!chord.notes.length) throw new Error(`Cannot voice unsupported chord: ${chordSymbol}`);
  const pitchClasses = getChordPitchClasses(chordSymbol);
  const root = getChordRoot(chordSymbol);
  const bassCandidates = policy.allowInversions ? pitchClasses.slice(0, 3) : [root];

  return bassCandidates.flatMap((bassPc, bassIndex) => {
    const bass = pitchClassToMidiInRange(bassPc, policy.bassRange, true);
    return [0, 1, 2].map((rotation) => {
      const upper = upperVoicesForPitchClasses(pitchClasses, policy, rotation + bassIndex);
      const allNotes = [bass, ...upper].sort((a, b) => a - b);
      return { chordSymbol, roman, bass, upperVoices: upper, allNotes };
    });
  });
}
