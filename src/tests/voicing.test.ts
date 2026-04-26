import { describe, expect, it } from "vitest";
import { generateVoicedProgression } from "../core/voicing";
import { pitchClassSetFromMidi } from "../core/voicing/pitchUtils";

describe("voicing engine", () => {
  it("generates notes for basic C major chords", () => {
    const voiced = generateVoicedProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi", "IV", "V"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced).toHaveLength(4);
    voiced.forEach((chord) => {
      expect(chord.allNotes.length).toBeGreaterThanOrEqual(4);
      expect(Math.min(...chord.allNotes)).toBeGreaterThanOrEqual(36);
      expect(Math.max(...chord.allNotes)).toBeLessThanOrEqual(76);
    });
    expect(voiced[0].bass).toBe(36);
    expect(voiced[1].bass).toBe(45);
  });

  it("keeps common tones or small movement for C to Am", () => {
    const [c, am] = generateVoicedProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi"],
      instrumentPreset: "piano_smooth",
    });
    const common = pitchClassSetFromMidi(c.upperVoices).filter((pc) => pitchClassSetFromMidi(am.upperVoices).includes(pc));
    expect(common.length).toBeGreaterThanOrEqual(1);
  });

  it("does not omit the third in clear piano voicings", () => {
    const [c] = generateVoicedProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I"],
      instrumentPreset: "piano_clear",
    });
    expect(pitchClassSetFromMidi(c.allNotes)).toContain("E");
  });
});
