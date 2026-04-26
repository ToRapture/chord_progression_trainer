import type { InstrumentPresetId } from "../voicing/types";
import type { InstrumentDescriptor } from "./types";
import { piano } from "./piano";
import { guitar } from "./guitar";
import { strings } from "./strings";

export const INSTRUMENTS: Record<InstrumentPresetId, InstrumentDescriptor> = {
  piano_clear: piano.clear,
  piano_smooth: piano.smooth,
  guitar_open: guitar.open,
  strings_quartet_basic: strings.basic,
};

export type { InstrumentDescriptor } from "./types";
