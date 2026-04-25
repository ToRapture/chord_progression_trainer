import { VoicedChord } from "../voicing/types";
import { InstrumentEvent, InstrumentPresetId, Articulation } from "../instruments/types";
import { PlaybackOptions, DEFAULT_PLAYBACK_OPTIONS } from "./types";

export function scheduleVoicedChords(
  voicedChords: VoicedChord[],
  options: Partial<PlaybackOptions> = {},
  presetId: InstrumentPresetId = "piano_clear",
  articulation: Articulation = "block"
): InstrumentEvent[] {
  const opts: PlaybackOptions = { ...DEFAULT_PLAYBACK_OPTIONS, ...options };
  const secondsPerBeat = 60 / opts.tempo;
  const secondsPerChord = secondsPerBeat * opts.beatsPerChord;

  return voicedChords.map((vc, i) => ({
    time: i * secondsPerChord,
    duration: secondsPerChord * 0.98,
    instrument: presetId,
    notes: vc.allNotes,
    velocity: 0.7,
    articulation,
  }));
}

export function scheduleArpeggio(
  voicedChords: VoicedChord[],
  options: Partial<PlaybackOptions> = {},
  presetId: InstrumentPresetId = "piano_clear",
  direction: "up" | "down" = "up"
): InstrumentEvent[] {
  const opts: PlaybackOptions = { ...DEFAULT_PLAYBACK_OPTIONS, ...options };
  const secondsPerBeat = 60 / opts.tempo;
  const secondsPerChord = secondsPerBeat * opts.beatsPerChord;
  const delayBetweenNotes = 0.08;

  const events: InstrumentEvent[] = [];

  for (let i = 0; i < voicedChords.length; i++) {
    const vc = voicedChords[i]!;
    const sortedNotes =
      direction === "up"
        ? [...vc.allNotes].sort((a, b) => a - b)
        : [...vc.allNotes].sort((a, b) => b - a);

    for (let j = 0; j < sortedNotes.length; j++) {
      events.push({
        time: i * secondsPerChord + j * delayBetweenNotes,
        duration: secondsPerChord * 0.8,
        instrument: presetId,
        notes: [sortedNotes[j]!],
        velocity: 0.6,
        articulation: direction === "up" ? "arpeggio_up" : "arpeggio_down",
      });
    }
  }

  return events;
}

export function scheduleStrum(
  voicedChords: VoicedChord[],
  options: Partial<PlaybackOptions> = {},
  presetId: InstrumentPresetId = "piano_clear"
): InstrumentEvent[] {
  const opts: PlaybackOptions = { ...DEFAULT_PLAYBACK_OPTIONS, ...options };
  const secondsPerBeat = 60 / opts.tempo;
  const secondsPerChord = secondsPerBeat * opts.beatsPerChord;
  const delayBetweenNotes = 0.03;

  const events: InstrumentEvent[] = [];

  for (let i = 0; i < voicedChords.length; i++) {
    const vc = voicedChords[i]!;
    const sortedNotes = [...vc.allNotes].sort((a, b) => b - a);

    for (let j = 0; j < sortedNotes.length; j++) {
      events.push({
        time: i * secondsPerChord + j * delayBetweenNotes,
        duration: secondsPerChord * 0.7,
        instrument: presetId,
        notes: [sortedNotes[j]!],
        velocity: 0.5,
        articulation: "strum_down",
      });
    }
  }

  return events;
}

export function getTotalDuration(events: InstrumentEvent[]): number {
  if (events.length === 0) return 0;
  return Math.max(...events.map((e) => e.time + e.duration));
}
