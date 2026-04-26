import { Chord } from "@tonaljs/tonal";
import { getChordPitchClasses } from "../harmony/chordSymbols";
import type { VoicedChord, VoicingPolicy } from "./types";
import { pitchClassSetFromMidi, totalUpperMovement } from "./pitchUtils";

export function scoreVoicingCandidate(previous: VoicedChord | null, candidate: VoicedChord, policy: VoicingPolicy): number {
  const upperMovement = totalUpperMovement(previous, candidate);
  const largeLeapPenalty = previous
    ? candidate.upperVoices.reduce((sum, note, index) => sum + (Math.abs(note - (previous.upperVoices[index] ?? note)) > policy.maxUpperVoiceLeap ? 1 : 0), 0)
    : 0;
  const rangePenalty = candidate.upperVoices.some((note) => note < policy.upperRange[0] || note > policy.upperRange[1]) ? 10 : 0;
  const muddyLowIntervalPenalty = candidate.upperVoices.some((note) => note < 55 && note - candidate.bass < 7) ? 4 : 0;
  const chord = Chord.get(candidate.chordSymbol);
  const thirdPc = chord.intervals[1] ? getChordPitchClasses(candidate.chordSymbol)[1] : null;
  const pcs = pitchClassSetFromMidi(candidate.allNotes);
  const missingThirdPenalty = thirdPc && !pcs.includes(thirdPc) ? 5 : 0;
  const badBassPenalty = policy.preferRootBass && pcs[0] !== getChordPitchClasses(candidate.chordSymbol)[0] ? 4 : 0;
  return upperMovement + largeLeapPenalty * 2 + rangePenalty * 3 + muddyLowIntervalPenalty * 3 + missingThirdPenalty * 5 + badBassPenalty * 4;
}
