import { VoicingPolicy } from "./types";

export const PIANO_CLEAR: VoicingPolicy = {
  id: "piano_clear",
  name: "Piano Clear",
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

export const PIANO_SMOOTH: VoicingPolicy = {
  id: "piano_smooth",
  name: "Piano Smooth",
  bassRange: [36, 55],
  upperRange: [55, 79],
  upperVoiceCount: 3,
  preferRootBass: false,
  allowInversions: true,
  allowOmitFifth: true,
  allowExtensions: false,
  smoothVoiceLeading: true,
  maxUpperVoiceLeap: 7,
};

export const GUITAR_OPEN: VoicingPolicy = {
  id: "guitar_open",
  name: "Guitar Open",
  bassRange: [40, 52],
  upperRange: [52, 76],
  upperVoiceCount: 4,
  preferRootBass: true,
  allowInversions: false,
  allowOmitFifth: false,
  allowExtensions: false,
  smoothVoiceLeading: false,
  maxUpperVoiceLeap: 12,
};

export const STRINGS_QUARTET_BASIC: VoicingPolicy = {
  id: "strings_quartet_basic",
  name: "Strings Quartet Basic",
  bassRange: [36, 48],
  upperRange: [55, 79],
  upperVoiceCount: 3,
  preferRootBass: true,
  allowInversions: true,
  allowOmitFifth: true,
  allowExtensions: false,
  smoothVoiceLeading: true,
  maxUpperVoiceLeap: 5,
};

export function getPreset(id: string): VoicingPolicy {
  const presets: Record<string, VoicingPolicy> = {
    piano_clear: PIANO_CLEAR,
    piano_smooth: PIANO_SMOOTH,
    guitar_open: GUITAR_OPEN,
    strings_quartet_basic: STRINGS_QUARTET_BASIC,
  };
  return presets[id] ?? PIANO_CLEAR;
}

export function getAllPresets(): VoicingPolicy[] {
  return [PIANO_CLEAR, PIANO_SMOOTH, GUITAR_OPEN, STRINGS_QUARTET_BASIC];
}
