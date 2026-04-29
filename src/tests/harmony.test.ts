import { describe, it, expect } from "vitest";
import { romanToChordSymbol, progressionToChordSymbols, getScaleDegree, romanToChordInKey } from "../core/harmony/roman";
import { getFunctionGroup } from "../core/harmony/functionGroups";
import { keyLabel, SUPPORTED_KEYS } from "../core/harmony/keys";
import { chordNotes, chordRoot } from "../core/harmony/chordSymbols";
import * as Tonal from "tonal";

describe("Roman → Chord Symbol Conversion", () => {
  it("I in C major → C", () => {
    expect(romanToChordSymbol("I", { tonic: "C", mode: "major" })).toBe("C");
  });

  it("vi in C major → Am", () => {
    expect(romanToChordSymbol("vi", { tonic: "C", mode: "major" })).toBe("Am");
  });

  it("V in C major → G", () => {
    expect(romanToChordSymbol("V", { tonic: "C", mode: "major" })).toBe("G");
  });

  it("IV in C major → F", () => {
    expect(romanToChordSymbol("IV", { tonic: "C", mode: "major" })).toBe("F");
  });

  it("ii in C major → Dm", () => {
    expect(romanToChordSymbol("ii", { tonic: "C", mode: "major" })).toBe("Dm");
  });

  it("I in D major → D", () => {
    expect(romanToChordSymbol("I", { tonic: "D", mode: "major" })).toBe("D");
  });

  it("vi in D major → Bm", () => {
    expect(romanToChordSymbol("vi", { tonic: "D", mode: "major" })).toBe("Bm");
  });

  it("i in A minor → Am", () => {
    expect(romanToChordSymbol("i", { tonic: "A", mode: "minor" })).toBe("Am");
  });

  it("V in A minor → E", () => {
    expect(romanToChordSymbol("V", { tonic: "A", mode: "minor" })).toBe("E");
  });

  it("iv in A minor → Dm", () => {
    expect(romanToChordSymbol("iv", { tonic: "A", mode: "minor" })).toBe("Dm");
  });

  it("VI in A minor → F", () => {
    expect(romanToChordSymbol("VI", { tonic: "A", mode: "minor" })).toBe("F");
  });

  it("VII in A minor → G", () => {
    expect(romanToChordSymbol("VII", { tonic: "A", mode: "minor" })).toBe("G");
  });

  it("I in G major → G", () => {
    expect(romanToChordSymbol("I", { tonic: "G", mode: "major" })).toBe("G");
  });

  it("vi in G major → Em", () => {
    expect(romanToChordSymbol("vi", { tonic: "G", mode: "major" })).toBe("Em");
  });

  it("I in F major → F", () => {
    expect(romanToChordSymbol("I", { tonic: "F", mode: "major" })).toBe("F");
  });

  it("i in D minor → Dm", () => {
    expect(romanToChordSymbol("i", { tonic: "D", mode: "minor" })).toBe("Dm");
  });

  it("i in E minor → Em", () => {
    expect(romanToChordSymbol("i", { tonic: "E", mode: "minor" })).toBe("Em");
  });
});

describe("Progression to Chord Symbols", () => {
  it("I-vi-IV-V in C major → C-Am-F-G", () => {
    const result = progressionToChordSymbols(
      ["I", "vi", "IV", "V"],
      { tonic: "C", mode: "major" }
    );
    expect(result).toEqual(["C", "Am", "F", "G"]);
  });

  it("I-V-vi-IV in G major → G-D-Em-C", () => {
    const result = progressionToChordSymbols(
      ["I", "V", "vi", "IV"],
      { tonic: "G", mode: "major" }
    );
    expect(result).toEqual(["G", "D", "Em", "C"]);
  });

  it("i-iv-V-i in A minor → Am-Dm-E-Am", () => {
    const result = progressionToChordSymbols(
      ["i", "iv", "V", "i"],
      { tonic: "A", mode: "minor" }
    );
    expect(result).toEqual(["Am", "Dm", "E", "Am"]);
  });

  it("ii-V-I in C major → Dm-G-C", () => {
    const result = progressionToChordSymbols(
      ["ii", "V", "I"],
      { tonic: "C", mode: "major" }
    );
    expect(result).toEqual(["Dm", "G", "C"]);
  });
});

describe("Scale Degree", () => {
  it("I → 1", () => expect(getScaleDegree("I")).toBe(1));
  it("ii → 2", () => expect(getScaleDegree("ii")).toBe(2));
  it("IV → 4", () => expect(getScaleDegree("IV")).toBe(4));
  it("V → 5", () => expect(getScaleDegree("V")).toBe(5));
  it("vi → 6", () => expect(getScaleDegree("vi")).toBe(6));
  it("vii° → 7", () => expect(getScaleDegree("vii°")).toBe(7));
  it("i → 1", () => expect(getScaleDegree("i")).toBe(1));
  it("VI → 6", () => expect(getScaleDegree("VI")).toBe(6));
});

describe("Function Groups", () => {
  it("I in major is T", () => expect(getFunctionGroup("I", "major")).toBe("T"));
  it("vi in major is T", () => expect(getFunctionGroup("vi", "major")).toBe("T"));
  it("IV in major is PD", () => expect(getFunctionGroup("IV", "major")).toBe("PD"));
  it("ii in major is PD", () => expect(getFunctionGroup("ii", "major")).toBe("PD"));
  it("V in major is D", () => expect(getFunctionGroup("V", "major")).toBe("D"));
  it("V7 in major is D", () => expect(getFunctionGroup("V7", "major")).toBe("D"));
  it("vii° in major is D", () => expect(getFunctionGroup("vii°", "major")).toBe("D"));

  it("i in minor is T", () => expect(getFunctionGroup("i", "minor")).toBe("T"));
  it("VI in minor is T", () => expect(getFunctionGroup("VI", "minor")).toBe("T"));
  it("III in minor is T", () => expect(getFunctionGroup("III", "minor")).toBe("T"));
  it("iv in minor is PD", () => expect(getFunctionGroup("iv", "minor")).toBe("PD"));
  it("ii° in minor is PD", () => expect(getFunctionGroup("ii°", "minor")).toBe("PD"));
  it("V in minor is D", () => expect(getFunctionGroup("V", "minor")).toBe("D"));
  it("V7 in minor is D", () => expect(getFunctionGroup("V7", "minor")).toBe("D"));
  it("VII in minor is D", () => expect(getFunctionGroup("VII", "minor")).toBe("D"));
});

describe("Keys", () => {
  it("has the supported major keys in circle-of-fifths order", () => {
    const majorKeys = SUPPORTED_KEYS.filter((key) => key.mode === "major").map((key) => key.tonic);

    expect(majorKeys).toEqual(["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db", "Gb"]);
  });

  it("has relative minor keys matching the supported major keys", () => {
    const minorKeys = SUPPORTED_KEYS.filter((key) => key.mode === "minor").map((key) => key.tonic);

    expect(minorKeys).toEqual(["A", "E", "B", "F#", "C#", "G#", "D#", "D", "G", "C", "F", "Bb", "Eb"]);
  });

  it("has exactly 26 supported keys (13 major + 13 relative minor)", () => {
    expect(SUPPORTED_KEYS).toHaveLength(26);
  });

  it("keyLabel returns readable format", () => {
    expect(keyLabel({ tonic: "C", mode: "major" })).toBe("C");
    expect(keyLabel({ tonic: "A", mode: "minor" })).toBe("A");
  });

  it("generates valid chord symbols for every supported key", () => {
    const romansByMode = {
      major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
      minor: ["i", "ii°", "III", "iv", "v", "V", "V7", "VI", "VII", "vii°"],
    } as const;

    for (const key of SUPPORTED_KEYS) {
      for (const roman of romansByMode[key.mode]) {
        const symbol = romanToChordSymbol(roman, key);
        expect(Tonal.Chord.get(symbol).empty, `${roman} in ${keyLabel(key)} produced ${symbol}`).toBe(false);
      }
    }
  });
});

describe("ChordInKey", () => {
  it("has correct structure for I in C major", () => {
    const result = romanToChordInKey("I", { tonic: "C", mode: "major" });
    expect(result.roman).toBe("I");
    expect(result.symbol).toBe("C");
    expect(result.functionGroup).toBe("T");
    expect(result.scaleDegree).toBe(1);
    expect(result.chordTones).toEqual(["C", "E", "G"]);
    expect(result.source).toBe("diatonic");
  });

  it("has correct structure for V in A minor", () => {
    const result = romanToChordInKey("V", { tonic: "A", mode: "minor" });
    expect(result.roman).toBe("V");
    expect(result.symbol).toBe("E");
    expect(result.functionGroup).toBe("D");
    expect(result.scaleDegree).toBe(5);
    expect(result.source).toBe("harmonic_minor");
  });
});
