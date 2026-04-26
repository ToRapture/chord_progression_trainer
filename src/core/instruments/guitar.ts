import type { InstrumentDescriptor } from "./types";

export const guitar = {
  open: {
    id: "guitar_open",
    displayName: "Guitar Open Chords",
    midiProgram: 24,
    defaultVelocity: 90,
    articulation: "strum",
  } satisfies InstrumentDescriptor,
};
