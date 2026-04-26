import type { VoicedChord, VoicingPolicy } from "./types";
import { scoreVoicingCandidate } from "./voiceLeading";

export function chooseBestVoicing(
  candidates: VoicedChord[],
  prev: VoicedChord | null,
  policy: VoicingPolicy,
): VoicedChord {
  if (!candidates.length) {
    throw new Error("No voicing candidates supplied");
  }
  let best = candidates[0];
  let bestScore = scoreVoicingCandidate(prev, best, policy);
  for (const c of candidates.slice(1)) {
    const s = scoreVoicingCandidate(prev, c, policy);
    if (s < bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best;
}
