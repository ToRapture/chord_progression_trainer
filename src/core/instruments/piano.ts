import type { InstrumentDescriptor } from "./types";

export const piano = {
  clear: {
    id: "piano_clear",
    displayName: "Piano Clear",
    midiProgram: 0,
    defaultVelocity: 95,
    articulation: "block",
  } satisfies InstrumentDescriptor,
  smooth: {
    id: "piano_smooth",
    displayName: "Piano Smooth",
    midiProgram: 0,
    defaultVelocity: 80,
    articulation: "sustain",
  } satisfies InstrumentDescriptor,
};
