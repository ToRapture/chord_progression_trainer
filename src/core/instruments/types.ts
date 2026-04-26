import type { InstrumentPresetId } from "../voicing/types";

export type InstrumentDescriptor = {
  id: InstrumentPresetId;
  displayName: string;
  midiProgram: number;
  defaultVelocity: number;
  articulation: "block" | "arpeggio" | "strum" | "sustain";
};
