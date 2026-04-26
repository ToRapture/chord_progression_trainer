import type { InstrumentPreset } from "./types";

export const instrumentPresets: InstrumentPreset[] = [
  { id: "piano_clear", name: "Piano Clear", description: "Root bass and clear upper triads for basic recognition." },
  { id: "piano_smooth", name: "Piano Smooth", description: "Closer upper voices and smoother chord connection." },
  { id: "guitar_open", name: "Guitar Open Chords", description: "Open-position guitar shapes when available." },
  { id: "strings_quartet_basic", name: "String Quartet Basic", description: "Four-part string-register voicing." },
];

export const instrumentPresetLabels = Object.fromEntries(instrumentPresets.map((preset) => [preset.id, preset.name])) as Record<InstrumentPreset["id"], string>;
