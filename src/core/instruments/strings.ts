import { ChordSymbol } from "../harmony/types";
import { MidiNote } from "../voicing/types";
import { getChordPitchClasses, pitchClassToMidi } from "../voicing/pitchUtils";

export interface StringQuartetVoicing {
  cello: MidiNote;
  viola: MidiNote;
  violin2: MidiNote;
  violin1: MidiNote;
}

export function voiceStringQuartet(
  chordSymbol: ChordSymbol,
  previous: StringQuartetVoicing | null = null
): StringQuartetVoicing {
  const pcs = getChordPitchClasses(chordSymbol);
  if (pcs.length === 0) {
    return { cello: 36, viola: 48, violin2: 55, violin1: 64 };
  }

  const root = pcs[0]!;
  const third = pcs[1] ?? pcs[0]!;
  const fifth = pcs[2] ?? pcs[0]!;
  const seventh = pcs[3] ?? pcs[0]!;

  let cello = pitchClassToMidi(root, 2);
  let viola = pitchClassToMidi(fifth, 3);
  let violin2 = pitchClassToMidi(third, 4);
  let violin1 = pitchClassToMidi(seventh, 5);

  if (previous) {
    const prevMidi = [previous.cello, previous.viola, previous.violin2, previous.violin1];
    const newMidi = [cello, viola, violin2, violin1];

    for (let i = 0; i < newMidi.length; i++) {
      const prev = prevMidi[i]!;
      const cur = newMidi[i]!;
      if (Math.abs(cur - prev) > 12) {
        if (cur > prev) {
          newMidi[i] = cur - 12;
        } else {
          newMidi[i] = cur + 12;
        }
      }
    }

    [cello, viola, violin2, violin1] = newMidi as [number, number, number, number];
  }

  return { cello, viola, violin2, violin1 };
}
