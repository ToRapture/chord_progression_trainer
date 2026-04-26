import type { VoicedChord, VoicingPolicy } from "./types";

export function scoreVoicingCandidate(
  prev: VoicedChord | null,
  cand: VoicedChord,
  policy: VoicingPolicy,
): number {
  let score = 0;

  if (prev) {
    const len = Math.min(prev.upperVoices.length, cand.upperVoices.length);
    let movement = 0;
    let largeLeap = 0;
    for (let i = 0; i < len; i++) {
      const d = Math.abs(prev.upperVoices[i] - cand.upperVoices[i]);
      movement += d;
      if (d > policy.maxUpperVoiceLeap) {
        largeLeap += d - policy.maxUpperVoiceLeap;
      }
    }
    score += movement * 1.0 + largeLeap * 2.0;

    const bassDiff = Math.abs(prev.bass - cand.bass);
    if (bassDiff > 12) score += (bassDiff - 12) * 1.5;
  }

  for (const m of cand.upperVoices) {
    if (m < policy.upperRange[0] || m > policy.upperRange[1]) score += 3.0;
  }
  if (cand.bass < policy.bassRange[0] || cand.bass > policy.bassRange[1]) {
    score += 4.0;
  }

  if (cand.upperVoices.length > 0) {
    const lowestUpper = cand.upperVoices[0];
    if (cand.bass < 48 && lowestUpper - cand.bass < 5) score += 3.0;
  }

  if (cand.upperVoices.length > 1) {
    for (let i = 1; i < cand.upperVoices.length; i++) {
      const gap = cand.upperVoices[i] - cand.upperVoices[i - 1];
      if (gap > 12) score += (gap - 12) * 0.5;
    }
  }

  return score;
}
