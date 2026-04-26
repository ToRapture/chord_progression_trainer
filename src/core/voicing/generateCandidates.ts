import type { ChordSymbol, RomanNumeral } from "../harmony/types";
import type { MidiNote, VoicedChord, VoicingPolicy } from "./types";
import {
  getChordPitchClasses,
  pitchClassMidiInRange,
  pitchClassToSemitone,
} from "./pitchUtils";

function placeUpperVoices(
  bass: MidiNote,
  upperPCs: string[],
  policy: VoicingPolicy,
): MidiNote[] {
  const upper: MidiNote[] = [];
  let cursor = Math.max(policy.upperRange[0], bass + 7);
  for (const pc of upperPCs.slice(0, policy.upperVoiceCount)) {
    const semi = pitchClassToSemitone(pc);
    let chosen: MidiNote | null = null;
    for (let m = cursor; m <= policy.upperRange[1] + 12; m++) {
      if (m % 12 === semi) {
        chosen = m;
        break;
      }
    }
    if (chosen == null) chosen = cursor;
    upper.push(chosen);
    cursor = chosen + 1;
  }
  upper.sort((a, b) => a - b);
  return upper;
}

function buildChord(
  chordSymbol: ChordSymbol,
  roman: RomanNumeral,
  bass: MidiNote,
  upperPCs: string[],
  policy: VoicingPolicy,
): VoicedChord {
  const upper = placeUpperVoices(bass, upperPCs, policy);
  return {
    chordSymbol,
    roman,
    bass,
    upperVoices: upper,
    allNotes: [bass, ...upper],
  };
}

function rotate<T>(arr: T[], n: number): T[] {
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

export function generateCandidates(
  chordSymbol: ChordSymbol,
  roman: RomanNumeral,
  policy: VoicingPolicy,
): VoicedChord[] {
  const tones = getChordPitchClasses(chordSymbol);
  if (tones.length < 3) return [];
  const root = tones[0];
  const third = tones[1];
  const fifth = tones[2];
  const seventh = tones.length >= 4 ? tones[3] : null;

  const candidates: VoicedChord[] = [];

  const rootBassOptions = pitchClassMidiInRange(
    root,
    policy.bassRange[0],
    policy.bassRange[1],
  );

  const baseUpper = seventh
    ? [third, fifth, seventh, root]
    : [third, fifth, root];

  for (const bass of rootBassOptions) {
    for (let rot = 0; rot < baseUpper.length; rot++) {
      const upperPCs = rotate(baseUpper, rot).slice(0, policy.upperVoiceCount);
      candidates.push(buildChord(chordSymbol, roman, bass, upperPCs, policy));
    }
    if (policy.allowOmitFifth && seventh) {
      const omittedFifth = [third, seventh, root];
      for (let rot = 0; rot < omittedFifth.length; rot++) {
        candidates.push(
          buildChord(
            chordSymbol,
            roman,
            bass,
            rotate(omittedFifth, rot),
            policy,
          ),
        );
      }
    }
  }

  if (policy.allowInversions) {
    const thirdBass = pitchClassMidiInRange(
      third,
      policy.bassRange[0],
      policy.bassRange[1],
    );
    for (const bass of thirdBass.slice(0, 1)) {
      const upperPCs = seventh
        ? [fifth, seventh, root]
        : [fifth, root, third];
      candidates.push(buildChord(chordSymbol, roman, bass, upperPCs, policy));
    }
  }

  return candidates;
}
