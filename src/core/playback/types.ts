import { InstrumentEvent } from "../instruments/types";

export interface PlaybackOptions {
  tempo: number;
  beatsPerChord: number;
}

export const DEFAULT_PLAYBACK_OPTIONS: PlaybackOptions = {
  tempo: 72,
  beatsPerChord: 4,
};
