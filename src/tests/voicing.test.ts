import { describe, expect, test } from "vitest";
import { voiceProgression } from "../core/voicing";

describe("Voicing engine", () => {
  test("Generates 4 voiced chords for I-vi-IV-V in C major piano_clear", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi", "IV", "V"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced.length).toBe(4);
    for (const v of voiced) {
      expect(v.allNotes.length).toBeGreaterThanOrEqual(4);
      expect(v.bass).toBeGreaterThanOrEqual(36);
      expect(v.bass).toBeLessThanOrEqual(55);
    }
  });

  test("piano_clear bass for tonic chord is the root pitch class", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced[0].bass % 12).toBe(0);
  });

  test("Upper voices remain in the configured upper range for piano_clear", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi", "IV", "V"],
      instrumentPreset: "piano_clear",
    });
    for (const v of voiced) {
      for (const u of v.upperVoices) {
        expect(u).toBeGreaterThanOrEqual(50);
        expect(u).toBeLessThanOrEqual(84);
      }
    }
  });

  test("C → Am keeps small total upper-voice movement (smooth voice leading)", () => {
    const v = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I", "vi"],
      instrumentPreset: "piano_clear",
    });
    let totalMove = 0;
    const len = Math.min(v[0].upperVoices.length, v[1].upperVoices.length);
    for (let i = 0; i < len; i++) {
      totalMove += Math.abs(v[0].upperVoices[i] - v[1].upperVoices[i]);
    }
    expect(totalMove).toBeLessThanOrEqual(8);
  });

  test("A minor i-iv-V-i: V has correct major root (E)", () => {
    const voiced = voiceProgression({
      key: { tonic: "A", mode: "minor" },
      progression: ["i", "iv", "V", "i"],
      instrumentPreset: "piano_clear",
    });
    expect(voiced.length).toBe(4);
    expect(voiced[2].bass % 12).toBe(4); // E = 4 semitones above C
  });

  test("Each voicing contains the third (chord identity)", () => {
    const voiced = voiceProgression({
      key: { tonic: "C", mode: "major" },
      progression: ["I"],
      instrumentPreset: "piano_clear",
    });
    const chord = voiced[0];
    const pcSet = new Set(chord.allNotes.map((n) => n % 12));
    expect(pcSet.has(0)).toBe(true);  // C
    expect(pcSet.has(4)).toBe(true);  // E (major third)
    expect(pcSet.has(7)).toBe(true);  // G
  });
});
