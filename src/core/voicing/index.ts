import { romanToChordSymbol } from "../harmony/roman";
import { chooseBestVoicing } from "./chooseBestVoicing";
import { generateVoicingCandidates } from "./generateCandidates";
import { voicingPolicies } from "./presets";
import type { VoicedChord, VoicingInput } from "./types";

export function generateVoicedProgression(input: VoicingInput): VoicedChord[] {
  const policy = voicingPolicies[input.instrumentPreset];
  const voiced: VoicedChord[] = [];
  for (const roman of input.progression) {
    const chordSymbol = romanToChordSymbol(roman, input.key);
    const candidates = generateVoicingCandidates(chordSymbol, roman, policy);
    const best = chooseBestVoicing(voiced.length ? voiced[voiced.length - 1] : null, candidates, policy);
    voiced.push(best);
  }
  return voiced;
}
