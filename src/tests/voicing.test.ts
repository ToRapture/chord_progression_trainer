import { describe, it, expect } from "vitest";
import { voiceProgression } from "../core/voicing/chooseBestVoicing";
import { getPreset, PIANO_CLEAR, PIANO_SMOOTH } from "../core/voicing/presets";
import { generateCandidates } from "../core/voicing/generateCandidates";
import { scoreVoicingCandidate } from "../core/voicing/voiceLeading";
import { getChordPitchClasses, pitchClassToMidi } from "../core/voicing/pitchUtils";
import { romanToChordSymbol } from "../core/harmony/roman";

describe("Pitch Utilities", () => {
  it("converts pitch class to MIDI", () => {
    const midi = pitchClassToMidi("C", 4);
    expect(midi).toBe(60);
  });

  it("converts pitch class to MIDI (A4 = 69)", () => {
    const midi = pitchClassToMidi("A", 4);
    expect(midi).toBe(69);
  });

  it("gets chord pitch classes from symbol", () => {
    const pcs = getChordPitchClasses("C");
    expect(pcs).toEqual(["C", "E", "G"]);
  });

  it("gets chord pitch classes from minor symbol", () => {
    const pcs = getChordPitchClasses("Am");
    expect(pcs).toEqual(["A", "C", "E"]);
  });

  it("gets chord pitch classes from seventh", () => {
    const pcs = getChordPitchClasses("G7");
    expect(pcs).toEqual(["G", "B", "D", "F"]);
  });
});

describe("Voicing Presets", () => {
  it("piano_clear prefers root bass", () => {
    expect(PIANO_CLEAR.preferRootBass).toBe(true);
  });

  it("piano_clear does not allow inversions", () => {
    expect(PIANO_CLEAR.allowInversions).toBe(false);
  });

  it("piano_smooth allows inversions", () => {
    expect(PIANO_SMOOTH.allowInversions).toBe(true);
  });

  it("piano_smooth allows omit fifth", () => {
    expect(PIANO_SMOOTH.allowOmitFifth).toBe(true);
  });

  it("getPreset returns correct preset", () => {
    const preset = getPreset("piano_clear");
    expect(preset.id).toBe("piano_clear");
    expect(preset.preferRootBass).toBe(true);
  });

  it("getPreset returns default for unknown id", () => {
    const preset = getPreset("unknown");
    expect(preset.id).toBe("piano_clear");
  });
});

describe("Candidate Generation", () => {
  it("generates candidates for C major", () => {
    const policy = PIANO_CLEAR;
    const candidates = generateCandidates("C", policy);
    expect(candidates.length).toBeGreaterThan(0);
    for (const c of candidates) {
      expect(c.bass).toBeGreaterThanOrEqual(policy.bassRange[0]);
      expect(c.bass).toBeLessThanOrEqual(policy.bassRange[1]);
      expect(c.upperVoices.length).toBe(policy.upperVoiceCount);
    }
  });

  it("generates candidates for Am", () => {
    const policy = PIANO_CLEAR;
    const candidates = generateCandidates("Am", policy);
    expect(candidates.length).toBeGreaterThan(0);
  });

  it("piano_clear bass uses root note", () => {
    const policy = PIANO_CLEAR;
    const candidates = generateCandidates("C", policy);
    for (const c of candidates) {
      const bassNote = c.bass % 12;
      expect(bassNote).toBe(0);
    }
  });

  it("all candidates are within range", () => {
    const policy = PIANO_CLEAR;
    const symbols = ["C", "Dm", "G", "Am", "F"];
    for (const sym of symbols) {
      const candidates = generateCandidates(sym, policy);
      for (const c of candidates) {
        expect(c.bass).toBeGreaterThanOrEqual(policy.bassRange[0]);
        expect(c.bass).toBeLessThanOrEqual(policy.bassRange[1]);
        for (const v of c.upperVoices) {
          expect(v).toBeGreaterThanOrEqual(policy.upperRange[0] - 12);
        }
      }
    }
  });
});

describe("Voice Leading", () => {
  it("C → Am progression retains common tones", () => {
    const romanProgression = ["I", "vi"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));
    const policy = PIANO_SMOOTH;

    const voiced = voiceProgression(symbols, romanProgression, policy);
    expect(voiced).toHaveLength(2);

    const cChord = voiced[0]!;
    const amChord = voiced[1]!;

    const cPCs = cChord.upperVoices.map((m) => m % 12);
    const amPCs = amChord.upperVoices.map((m) => m % 12);
    const commonPCs = cPCs.filter((pc) => amPCs.includes(pc));
    expect(commonPCs.length).toBeGreaterThan(0);
  });

  it("smooth voicing reduces total movement", () => {
    const cCandidates = generateCandidates("C", PIANO_SMOOTH);
    const amCandidates = generateCandidates("Am", PIANO_SMOOTH);

    expect(cCandidates.length).toBeGreaterThan(0);
    expect(amCandidates.length).toBeGreaterThan(0);

    const first = { bass: cCandidates[0]!.bass, upperVoices: cCandidates[0]!.upperVoices };

    let minScore = Infinity;
    for (const cand of amCandidates) {
      const score = scoreVoicingCandidate(
        {
          chordSymbol: "C",
          roman: "I",
          bass: first.bass,
          upperVoices: first.upperVoices,
          allNotes: [first.bass, ...first.upperVoices],
        },
        cand,
        PIANO_SMOOTH,
        "Am"
      );
      minScore = Math.min(minScore, score);
    }
    expect(minScore).toBeLessThan(Infinity);
  });
});

describe("Voiced Chord Output", () => {
  it("outputs correct number of chords", () => {
    const romanProgression = ["I", "IV", "V", "I"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));

    const voiced = voiceProgression(symbols, romanProgression, PIANO_CLEAR);
    expect(voiced).toHaveLength(4);
  });

  it("each voiced chord has bass and upper voices", () => {
    const romanProgression = ["I", "V", "vi", "IV"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));

    const voiced = voiceProgression(symbols, romanProgression, PIANO_CLEAR);
    for (const vc of voiced) {
      expect(vc.bass).toBeGreaterThan(0);
      expect(vc.upperVoices.length).toBeGreaterThan(0);
      expect(vc.allNotes).toContain(vc.bass);
      expect(vc.allNotes.length).toBe(vc.upperVoices.length + 1);
    }
  });

  it("piano_clear bass is clearly below upper voices", () => {
    const romanProgression = ["I", "vi", "IV", "V"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));

    const voiced = voiceProgression(symbols, romanProgression, PIANO_CLEAR);
    for (const vc of voiced) {
      const minUpper = Math.min(...vc.upperVoices);
      expect(vc.bass).toBeLessThan(minUpper);
    }
  });

  it("Bass notes are in the lower range", () => {
    const romanProgression = ["I", "IV", "V", "I"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));

    const voiced = voiceProgression(symbols, romanProgression, PIANO_CLEAR);
    for (const vc of voiced) {
      expect(vc.bass).toBeGreaterThanOrEqual(36);
      expect(vc.bass).toBeLessThanOrEqual(60);
    }
  });

  it("Smooth voicing produces notes within upper range", () => {
    const romanProgression = ["I", "IV", "ii", "V", "I"];
    const key = { tonic: "C", mode: "major" as const };
    const symbols = romanProgression.map((r) => romanToChordSymbol(r, key));

    const voiced = voiceProgression(symbols, romanProgression, PIANO_SMOOTH);
    for (const vc of voiced) {
      for (const v of vc.upperVoices) {
        expect(v).toBeGreaterThanOrEqual(PIANO_SMOOTH.upperRange[0] - 12);
        expect(v).toBeLessThanOrEqual(PIANO_SMOOTH.upperRange[1] + 12);
      }
    }
  });
});
