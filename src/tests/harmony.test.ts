import { describe, expect, it } from "vitest";
import { romanToChordInKey, romanToChordSymbol } from "../core/harmony/roman";

describe("harmony rendering", () => {
  it("renders major roman numerals into chord symbols", () => {
    expect(romanToChordSymbol("I", { tonic: "C", mode: "major" })).toBe("C");
    expect(romanToChordSymbol("vi", { tonic: "C", mode: "major" })).toBe("Am");
    expect(romanToChordSymbol("I", { tonic: "D", mode: "major" })).toBe("D");
    expect(romanToChordSymbol("vi", { tonic: "D", mode: "major" })).toBe("Bm");
  });

  it("renders minor dominants and marks harmonic-minor source", () => {
    expect(romanToChordSymbol("i", { tonic: "A", mode: "minor" })).toBe("Am");
    expect(romanToChordSymbol("V", { tonic: "A", mode: "minor" })).toBe("E");
    expect(romanToChordInKey("V", { tonic: "A", mode: "minor" }).source).toBe("harmonic_minor");
  });
});
