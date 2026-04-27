import { VoicingCandidate, VoicingPolicy, MidiNote } from "./types";
import { ChordSymbol, PitchClass } from "../harmony/types";
import { getChordPitchClasses, pitchClassToMidi } from "./pitchUtils";

export function generateCandidates(
  chordSymbol: ChordSymbol,
  policy: VoicingPolicy
): VoicingCandidate[] {
  const pitchClasses = getChordPitchClasses(chordSymbol);
  if (pitchClasses.length === 0) return [];

  const candidates: VoicingCandidate[] = [];
  const root = pitchClasses[0];

  const bassOctaves = policy.preferRootBass ? [2, 3] : [2, 3, 4];
  const upperOctaves = [3, 4, 5];

  for (const bassOct of bassOctaves) {
    const bass = pitchClassToMidi(root, bassOct);
    if (!policy.allowInversions && bassOct > 3) continue;
    if (bass < policy.bassRange[0] || bass > policy.bassRange[1]) continue;

    const voiceCount = policy.upperVoiceCount;
    const pcs = policy.allowOmitFifth && pitchClasses.length > 3
      ? pitchClasses.filter((_, i) => i !== 2)
      : pitchClasses;

    for (const startOct of upperOctaves) {
      const upperVoices: MidiNote[] = [];
      let oct = startOct;

      const sortedPCs = [...pcs].sort();
      const nonBassPCs = sortedPCs.filter((pc) => pc !== root);
      const upperPriority = [...nonBassPCs, ...sortedPCs];
      for (let i = 0; i < voiceCount; i++) {
        const pc = upperPriority[i % upperPriority.length];
        let midi = pitchClassToMidi(pc, oct);

        if (upperVoices.length > 0 && midi <= upperVoices[upperVoices.length - 1]) {
          midi = pitchClassToMidi(pc, oct + 1);
        }

        if (midi <= bass) {
          midi = pitchClassToMidi(pc, oct + 2);
        }

        if (midi >= policy.upperRange[0] && midi <= policy.upperRange[1]) {
          upperVoices.push(midi);
        } else {
          midi = pitchClassToMidi(pc, 4);
          if (midi >= policy.upperRange[0] && midi <= policy.upperRange[1]) {
            upperVoices.push(midi);
          }
        }
      }

      if (upperVoices.length === voiceCount) {
        const sorted = [...upperVoices].sort((a, b) => a - b);
        const isDuplicate = candidates.some(
          (c) =>
            c.bass === bass &&
            c.upperVoices.length === sorted.length &&
            c.upperVoices.every((v, i) => v === sorted[i])
        );
        if (!isDuplicate) {
          candidates.push({ bass, upperVoices: sorted });
        }
      }
    }
  }

  if (!policy.allowExtensions) {
    return candidates.filter((c) => c.upperVoices.length <= 4);
  }

  return candidates;
}

export function generateCandidatesWithInversions(
  chordSymbol: ChordSymbol,
  policy: VoicingPolicy
): VoicingCandidate[] {
  if (!policy.allowInversions) {
    return generateCandidates(chordSymbol, policy);
  }

  const pitchClasses = getChordPitchClasses(chordSymbol);
  if (pitchClasses.length < 3) return generateCandidates(chordSymbol, policy);

  const candidates = generateCandidates(chordSymbol, policy);

  for (let inv = 1; inv < pitchClasses.length; inv++) {
    const bassPC = pitchClasses[inv];
    const bassOctaves = [2, 3];
    for (const bassOct of bassOctaves) {
      const bass = pitchClassToMidi(bassPC, bassOct);
      if (bass < policy.bassRange[0] || bass > policy.bassRange[1]) continue;

      const voiceCount = policy.upperVoiceCount;
      const sortedPCs = [...pitchClasses].sort();

      for (const startOct of [3, 4]) {
        const upperVoices: MidiNote[] = [];
        let oct = startOct;

        const nonBassPCs = sortedPCs.filter((pc) => pc !== bassPC);
        const upperPriority = [...nonBassPCs, ...sortedPCs];
        for (let i = 0; i < voiceCount; i++) {
          const pc = upperPriority[i % upperPriority.length];
          let midi = pitchClassToMidi(pc, oct);

          if (upperVoices.length > 0 && midi <= upperVoices[upperVoices.length - 1]) {
            midi = pitchClassToMidi(pc, oct + 1);
          }

          if (midi <= bass) {
            midi = pitchClassToMidi(pc, oct + 2);
          }

          if (midi >= policy.upperRange[0] && midi <= policy.upperRange[1]) {
            upperVoices.push(midi);
          } else {
            midi = pitchClassToMidi(pc, 4);
            if (midi >= policy.upperRange[0] && midi <= policy.upperRange[1]) {
              upperVoices.push(midi);
            }
          }
        }

        if (upperVoices.length === voiceCount) {
          const sorted = [...upperVoices].sort((a, b) => a - b);
          candidates.push({ bass, upperVoices: sorted });
        }
      }
    }
  }

  return candidates;
}
