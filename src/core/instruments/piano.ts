import { InstrumentPresetId, Articulation } from "./types";
import { VoicingPolicy } from "../voicing/types";

export interface PianoConfig {
  presetId: InstrumentPresetId;
  voicingPolicy: VoicingPolicy;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  articulation: Articulation;
}

export function getPianoConfig(presetId: InstrumentPresetId): PianoConfig {
  const configs: Record<string, PianoConfig> = {
    piano_clear: {
      presetId: "piano_clear",
      voicingPolicy: {
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
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1.5,
      },
      articulation: "block",
    },
    piano_smooth: {
      presetId: "piano_smooth",
      voicingPolicy: {
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
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 2.0,
      },
      articulation: "block",
    },
  };

  return configs[presetId] ?? configs.piano_clear!;
}
