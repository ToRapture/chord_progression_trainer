import { VoicingPolicy } from "./types";

export const PIANO: VoicingPolicy = {
  id: "piano",
  name: "Piano",
  bassRange: [36, 48],
  upperRange: [60, 79],
  upperVoiceCount: 3,
  preferRootBass: true,
  allowInversions: false,
  allowOmitFifth: false,
  allowExtensions: false,
  smoothVoiceLeading: true,
  maxUpperVoiceLeap: 5,
};

export function getPreset(id: string): VoicingPolicy {
  return PIANO;
}
