import type { InstrumentEvent, InstrumentPresetId, VoicedChord } from "../voicing/types";

export type ScheduleOptions = {
  beatsPerChord: number;
  bpm: number;
  presetId: InstrumentPresetId;
};

export function scheduleVoicedProgression(voicedChords: VoicedChord[], options: ScheduleOptions): InstrumentEvent[] {
  const secondsPerBeat = 60 / options.bpm;
  const duration = options.beatsPerChord * secondsPerBeat * 0.98;
  const step = options.beatsPerChord * secondsPerBeat;
  return voicedChords.map((chord, index) => ({
    time: index * step,
    duration,
    instrument: options.presetId,
    notes: chord.allNotes,
    velocity: options.presetId === "guitar_open" ? 0.78 : 0.72,
    articulation: options.presetId === "guitar_open" ? "strum" : options.presetId === "strings_quartet_basic" ? "sustain" : "block",
  }));
}
