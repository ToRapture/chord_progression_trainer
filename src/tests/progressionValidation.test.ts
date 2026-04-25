import { describe, it, expect } from "vitest";
import {
  validateProgressionTemplate,
  validateProgressionAgainstOptions,
} from "../core/harmony/validateProgression";
import { getAllProgressions, majorBasic, minorBasic, pop, jazzBasic } from "../core/progressions/index";

describe("Progression Library Integrity", () => {
  it("has at least 60 total progressions", () => {
    const all = getAllProgressions();
    expect(all.length).toBeGreaterThanOrEqual(60);
  });

  it("has at least 20 major basic progressions", () => {
    expect(majorBasic.length).toBeGreaterThanOrEqual(20);
  });

  it("has at least 15 minor basic progressions", () => {
    expect(minorBasic.length).toBeGreaterThanOrEqual(15);
  });

  it("has at least 15 pop progressions", () => {
    expect(pop.length).toBeGreaterThanOrEqual(15);
  });

  it("has at least 10 jazz progressions", () => {
    expect(jazzBasic.length).toBeGreaterThanOrEqual(10);
  });

  it("every progression has a non-empty id", () => {
    const all = getAllProgressions();
    for (const p of all) {
      expect(p.id).toBeTruthy();
      expect(typeof p.id).toBe("string");
      expect(p.id.trim().length).toBeGreaterThan(0);
    }
  });

  it("every progression has a non-empty roman array", () => {
    const all = getAllProgressions();
    for (const p of all) {
      expect(p.roman).toBeTruthy();
      expect(p.roman.length).toBeGreaterThan(0);
      expect(Array.isArray(p.roman)).toBe(true);
    }
  });

  it("every progression has functions array matching roman length", () => {
    const all = getAllProgressions();
    for (const p of all) {
      expect(p.functions).toBeTruthy();
      expect(p.functions.length).toBe(p.roman.length);
    }
  });

  it("every progression has difficulty between 1 and 5", () => {
    const all = getAllProgressions();
    for (const p of all) {
      expect(p.difficulty).toBeGreaterThanOrEqual(1);
      expect(p.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it("every progression has tags", () => {
    const all = getAllProgressions();
    for (const p of all) {
      expect(p.tags).toBeTruthy();
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it("every progression passes validation", () => {
    const all = getAllProgressions();
    for (const p of all) {
      const result = validateProgressionTemplate({
        id: p.id,
        roman: p.roman,
        functions: p.functions,
        mode: p.mode,
        difficulty: p.difficulty,
        tags: p.tags,
      });
      expect(result.valid, `Validation failed for ${p.id}: ${result.errors.join(", ")}`).toBe(true);
    }
  });

  it("all progressions have unique IDs", () => {
    const all = getAllProgressions();
    const ids = all.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("Progression Validation Against Options", () => {
  it("rejects empty progression", () => {
    const result = validateProgressionAgainstOptions([], ["I", "IV", "V"], "major");
    expect(result.valid).toBe(false);
  });

  it("rejects chord not in allowed set", () => {
    const result = validateProgressionAgainstOptions(
      ["I", "vi", "IV", "V"],
      ["I", "IV", "V"],
      "major"
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("accepts valid progression with all chords allowed", () => {
    const result = validateProgressionAgainstOptions(
      ["I", "IV", "V", "I"],
      ["I", "IV", "V", "vi"],
      "major"
    );
    expect(result.valid).toBe(true);
  });
});

describe("ProgressionTemplate Validation", () => {
  it("rejects empty id", () => {
    const result = validateProgressionTemplate({
      id: "",
      roman: ["I", "V"],
      mode: "major",
      difficulty: 1,
      tags: ["test"],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects empty roman array", () => {
    const result = validateProgressionTemplate({
      id: "test",
      roman: [],
      mode: "major",
      difficulty: 1,
      tags: ["test"],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects difficulty out of range", () => {
    const result = validateProgressionTemplate({
      id: "test",
      roman: ["I"],
      mode: "major",
      difficulty: 6 as 1,
      tags: ["test"],
    });
    expect(result.valid).toBe(false);
  });

  it("warns on mismatched function length", () => {
    const result = validateProgressionTemplate({
      id: "test",
      roman: ["I", "V"],
      functions: ["T"],
      mode: "major",
      difficulty: 1,
      tags: ["test"],
    });
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
