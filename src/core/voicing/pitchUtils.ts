import * as Tonal from "tonal";
import { MidiNote } from "./types";
import { ChordSymbol, PitchClass } from "../harmony/types";

export function pitchClassToMidi(
  pc: PitchClass,
  octave: number
): MidiNote {
  const note = pc + String(octave);
  const midi = Tonal.Note.midi(note);
  return midi ?? 60;
}

export function midiToPitchClass(midi: MidiNote): PitchClass {
  const note = Tonal.Note.fromMidi(midi);
  return note ? note.replace(/\d/g, "") : "C";
}

export function midiToNoteName(midi: MidiNote): string {
  return Tonal.Note.fromMidi(midi) || "C4";
}

export function getChordPitchClasses(symbol: ChordSymbol): PitchClass[] {
  const chord = Tonal.Chord.get(symbol);
  if (!chord || !chord.notes) return [];
  return chord.notes;
}

export function getChordRoot(symbol: ChordSymbol): PitchClass {
  return Tonal.Chord.get(symbol)?.tonic ?? "C";
}

export function distributeVoicesInRange(
  pitchClasses: PitchClass[],
  bassOctave: number,
  upperStartOctave: number,
  upperCount: number,
  upperRange: [MidiNote, MidiNote]
): { bass: MidiNote; upperVoices: MidiNote[] } {
  const root = pitchClasses[0];
  const bass = pitchClassToMidi(root, bassOctave);

  const upperPCs = pitchClasses.length >= upperCount
    ? pitchClasses
    : [...pitchClasses, ...pitchClasses.slice(0, upperCount - pitchClasses.length)];

  const upperVoices: MidiNote[] = [];
  let currentOctave = upperStartOctave;

  for (let i = 0; i < upperCount; i++) {
    const pc = upperPCs[i % upperPCs.length];
    let midi = pitchClassToMidi(pc, currentOctave);

    while (midi < upperRange[0] && currentOctave < 8) {
      currentOctave++;
      midi = pitchClassToMidi(pc, currentOctave);
    }
    while (midi > upperRange[1] && currentOctave > 0) {
      currentOctave--;
      midi = pitchClassToMidi(pc, currentOctave);
    }

    if (midi <= bass) {
      midi = pitchClassToMidi(pc, currentOctave + 1);
    }

    upperVoices.push(midi);
  }

  return { bass, upperVoices };
}
