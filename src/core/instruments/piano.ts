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

export function getPianoConfig(_presetId: InstrumentPresetId): PianoConfig {
  return {
    presetId: "piano",
    voicingPolicy: {
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
    },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1.5,
    },
    articulation: "block",
  };
}
