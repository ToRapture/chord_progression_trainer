export type InstrumentPresetId =
  | "piano_clear"
  | "piano_smooth"
  | "guitar_open"
  | "strings_quartet_basic";

export type Articulation =
  | "block"
  | "arpeggio_up"
  | "arpeggio_down"
  | "strum_down"
  | "sustain";

export interface InstrumentEvent {
  time: number;
  duration: number;
  instrument: InstrumentPresetId;
  notes: number[];
  velocity: number;
  articulation: Articulation;
}
