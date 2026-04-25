import { ChordSymbol, NoteName } from "../harmony/types";
import { MidiNote } from "../voicing/types";

const GUITAR_OPEN_SHAPES: Record<string, MidiNote[]> = {
  C: [48, 52, 55, 60, 64],
  G: [43, 47, 50, 55, 59, 67],
  Am: [45, 52, 57, 60, 64],
  Em: [40, 47, 52, 55, 59, 64],
  F: [41, 48, 53, 57, 60, 65],
  Dm: [50, 57, 62, 65],
  D: [50, 57, 62, 66],
  E: [40, 47, 52, 56, 59, 64],
  A: [45, 52, 57, 61, 64],
  B7: [47, 50, 56, 59, 63],
  G7: [43, 47, 50, 55, 59],
  C7: [48, 52, 55, 58, 60],
  D7: [50, 57, 60, 62, 66],
  A7: [45, 52, 57, 60, 64],
  E7: [40, 47, 52, 56, 61, 64],
  Am7: [45, 52, 55, 60, 64],
  Dm7: [50, 57, 60, 62, 65],
  Em7: [40, 47, 50, 55, 59, 64],
  Bm7: [47, 50, 54, 57, 62],
};

export function getGuitarShape(chordSymbol: ChordSymbol): MidiNote[] | null {
  return GUITAR_OPEN_SHAPES[chordSymbol] ?? null;
}

export function hasGuitarShape(chordSymbol: ChordSymbol): boolean {
  return chordSymbol in GUITAR_OPEN_SHAPES;
}

export function getAllGuitarShapes(): Record<string, MidiNote[]> {
  return { ...GUITAR_OPEN_SHAPES };
}
