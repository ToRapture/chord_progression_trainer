import type { InstrumentEvent, VoicedChord } from "../voicing/types";

export type ScheduleOptions = {
  tempoBpm: number;
  beatsPerChord?: number;
  velocity?: number;
  instrument?: string;
  articulation?: "block" | "arpeggio" | "strum" | "sustain";
};

export function scheduleEvents(
  chords: VoicedChord[],
  opts: ScheduleOptions,
): InstrumentEvent[] {
  const beats = opts.beatsPerChord ?? 4;
  const secondsPerBeat = 60 / opts.tempoBpm;
  const secondsPerChord = beats * secondsPerBeat;
  const events: InstrumentEvent[] = [];
  for (let i = 0; i < chords.length; i++) {
    events.push({
      time: i * secondsPerChord,
      duration: secondsPerChord * 0.98,
      instrument: opts.instrument ?? "default",
      notes: chords[i].allNotes,
      velocity: opts.velocity ?? 90,
      articulation: opts.articulation ?? "block",
    });
  }
  return events;
}
