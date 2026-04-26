import type { InstrumentPresetId } from "../voicing/types";

export type InstrumentPreset = {
  id: InstrumentPresetId;
  name: string;
  description: string;
};
