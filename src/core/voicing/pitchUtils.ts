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

export function pitchClassToSemitone(pc: string): number {
  const m = Note.midi(`${pc}4`);
  if (m == null) throw new Error(`Invalid pitch class: ${pc}`);
  return m % 12;
}

export function pitchClassMidiInRange(
  pc: string,
  low: number,
  high: number,
): number[] {
  const semi = pitchClassToSemitone(pc);
  const out: number[] = [];
  for (let m = low; m <= high; m++) {
    if (m % 12 === semi) out.push(m);
  }
  return out;
}
