import type { VoicedChord, VoicingPolicy } from "./types";
import { scoreVoicingCandidate } from "./voiceLeading";

export function chooseBestVoicing(previous: VoicedChord | null, candidates: VoicedChord[], policy: VoicingPolicy): VoicedChord {
  if (!candidates.length) throw new Error("Cannot choose from an empty voicing candidate list.");
  return [...candidates].sort((a, b) => scoreVoicingCandidate(previous, a, policy) - scoreVoicingCandidate(previous, b, policy))[0];
}
