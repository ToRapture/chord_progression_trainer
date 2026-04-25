import { VoicedChord, VoicingCandidate, VoicingPolicy } from "./types";
import { ChordSymbol } from "../harmony/types";
import {
  generateCandidates,
  generateCandidatesWithInversions,
} from "./generateCandidates";
import { scoreVoicingCandidate } from "./voiceLeading";
import { getChordRoot } from "./pitchUtils";

export function chooseBestVoicing(
  previous: VoicedChord | null,
  candidates: VoicingCandidate[],
  policy: VoicingPolicy,
  chordSymbol: ChordSymbol
): VoicingCandidate {
  if (candidates.length === 0) {
    return { bass: 48, upperVoices: [52, 55, 60] };
  }

  let bestCandidate = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = scoreVoicingCandidate(previous, candidate, policy, chordSymbol);
    if (score < bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

export function voiceProgression(
  chordSymbols: ChordSymbol[],
  romanNumerals: string[],
  policy: VoicingPolicy
): VoicedChord[] {
  const voicedChords: VoicedChord[] = [];
  let previous: VoicedChord | null = null;

  for (let i = 0; i < chordSymbols.length; i++) {
    const symbol = chordSymbols[i];
    const roman = romanNumerals[i] ?? "?";

    const candidates = policy.allowInversions
      ? generateCandidatesWithInversions(symbol, policy)
      : generateCandidates(symbol, policy);

    if (candidates.length === 0) {
      const fallback: VoicedChord = {
        chordSymbol: symbol,
        roman,
        bass: 48,
        upperVoices: [52, 55, 60],
        allNotes: [48, 52, 55, 60],
      };
      voicedChords.push(fallback);
      previous = fallback;
      continue;
    }

    const chosen = chooseBestVoicing(previous, candidates, policy, symbol);

    const allNotes = [chosen.bass, ...chosen.upperVoices].sort((a, b) => a - b);

    const voicedChord: VoicedChord = {
      chordSymbol: symbol,
      roman,
      bass: chosen.bass,
      upperVoices: chosen.upperVoices,
      allNotes,
    };

    voicedChords.push(voicedChord);
    previous = voicedChord;
  }

  return voicedChords;
}
