import type { InstrumentEvent, InstrumentPresetId, MidiNote } from "../voicing/types";

export type PlaybackEngine = {
  initAudio?: () => Promise<void>;
  playEvents: (events: InstrumentEvent[], presetId?: InstrumentPresetId) => Promise<void>;
  playChord: (notes: MidiNote[], duration: number, presetId?: InstrumentPresetId, velocity?: number) => Promise<void>;
  stop: () => void;
  setTempo?: (bpm: number) => void;
  getTempo?: () => number;
  dispose: () => void;
};
