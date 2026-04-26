import type { ChordSymbol, KeySignature, RomanNumeral } from "../harmony/types";
import type { InstrumentPresetId, VoicedChord } from "./types";
import { romanProgressionToChordSymbols } from "../harmony/chordSymbols";
import { generateCandidates } from "./generateCandidates";
import { chooseBestVoicing } from "./chooseBestVoicing";
import { VOICING_PRESETS } from "./presets";

export type VoicingInput = {
  key: KeySignature;
  progression: RomanNumeral[];
  instrumentPreset: InstrumentPresetId;
};

export function voiceProgression(input: VoicingInput): VoicedChord[] {
  const policy = VOICING_PRESETS[input.instrumentPreset];
  const symbols: ChordSymbol[] = romanProgressionToChordSymbols(
    input.progression,
    input.key,
  );
  const out: VoicedChord[] = [];
  let prev: VoicedChord | null = null;
  for (let i = 0; i < symbols.length; i++) {
    const cands = generateCandidates(symbols[i], input.progression[i], policy);
    if (!cands.length) continue;
    const chosen = chooseBestVoicing(cands, prev, policy);
    out.push(chosen);
    prev = chosen;
  }
  return out;
}

export type {
  InstrumentPresetId,
  VoicedChord,
  VoicingPolicy,
  InstrumentEvent,
  MidiNote,
} from "./types";
