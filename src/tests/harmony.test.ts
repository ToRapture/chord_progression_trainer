import { describe, expect, test } from "vitest";
import {
  romanProgressionToChordSymbols,
  romanToChordSymbol,
} from "../core/harmony/chordSymbols";
import { getFunctionGroup } from "../core/harmony/functionGroups";
import { parseRoman } from "../core/harmony/roman";

describe("Roman parser", () => {
  test("I parses as degree 1, major, no seventh", () => {
    const r = parseRoman("I");
    expect(r.degree).toBe(1);
    expect(r.quality).toBe("major");
    expect(r.seventh).toBe("none");
  });
  test("vii° parses as diminished", () => {
    expect(parseRoman("vii°").quality).toBe("diminished");
  });
  test("V7 parses with dom7", () => {
    expect(parseRoman("V7").seventh).toBe("dom7");
  });
  test("ii7 parses as min7", () => {
    expect(parseRoman("ii7").seventh).toBe("min7");
  });
  test("Imaj7 parses as maj7", () => {
    expect(parseRoman("Imaj7").seventh).toBe("maj7");
  });
  test("viiø7 parses as halfDim7", () => {
    expect(parseRoman("viiø7").seventh).toBe("halfDim7");
  });
  test("bVII has flat=true and degree 7", () => {
    const r = parseRoman("bVII");
    expect(r.flat).toBe(true);
    expect(r.degree).toBe(7);
  });
});

describe("Roman → Chord symbol (major keys)", () => {
  test("C major: I → C", () => {
    expect(romanToChordSymbol("I", { tonic: "C", mode: "major" })).toBe("C");
  });
  test("C major: vi → Am", () => {
    expect(romanToChordSymbol("vi", { tonic: "C", mode: "major" })).toBe("Am");
  });
  test("C major: V7 → G7", () => {
    expect(romanToChordSymbol("V7", { tonic: "C", mode: "major" })).toBe("G7");
  });
  test("D major: I → D", () => {
    expect(romanToChordSymbol("I", { tonic: "D", mode: "major" })).toBe("D");
  });
  test("D major: vi → Bm", () => {
    expect(romanToChordSymbol("vi", { tonic: "D", mode: "major" })).toBe("Bm");
  });
  test("Progression I-vi-IV-V in C major", () => {
    expect(
      romanProgressionToChordSymbols(
        ["I", "vi", "IV", "V"],
        { tonic: "C", mode: "major" },
      ),
    ).toEqual(["C", "Am", "F", "G"]);
  });
});

describe("Roman → Chord symbol (minor keys)", () => {
  test("A minor: i → Am", () => {
    expect(romanToChordSymbol("i", { tonic: "A", mode: "minor" })).toBe("Am");
  });
  test("A minor: V → E (harmonic minor)", () => {
    expect(romanToChordSymbol("V", { tonic: "A", mode: "minor" })).toBe("E");
  });
  test("A minor: V7 → E7", () => {
    expect(romanToChordSymbol("V7", { tonic: "A", mode: "minor" })).toBe("E7");
  });
  test("A minor: iv → Dm", () => {
    expect(romanToChordSymbol("iv", { tonic: "A", mode: "minor" })).toBe("Dm");
  });
  test("A minor: VI → F", () => {
    expect(romanToChordSymbol("VI", { tonic: "A", mode: "minor" })).toBe("F");
  });
  test("A minor: VII → G", () => {
    expect(romanToChordSymbol("VII", { tonic: "A", mode: "minor" })).toBe("G");
  });
});

describe("Function groups", () => {
  test("Major: V is D", () => {
    expect(getFunctionGroup("V", "major")).toBe("D");
  });
  test("Major: ii is PD", () => {
    expect(getFunctionGroup("ii", "major")).toBe("PD");
  });
  test("Major: I is T", () => {
    expect(getFunctionGroup("I", "major")).toBe("T");
  });
  test("Minor: i is T", () => {
    expect(getFunctionGroup("i", "minor")).toBe("T");
  });
  test("Minor: V is D", () => {
    expect(getFunctionGroup("V", "minor")).toBe("D");
  });
});
