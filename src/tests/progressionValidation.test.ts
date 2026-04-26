import { describe, expect, test } from "vitest";
import { getAllProgressions } from "../core/progressions";
import { validateProgressionTemplate } from "../core/harmony/validateProgression";

describe("All progressions valid", () => {
  const all = getAllProgressions();

  test("Has 72 progressions across all groups", () => {
    expect(all.length).toBe(72);
  });

  test("All ids are unique", () => {
    const ids = all.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const p of getAllProgressions()) {
    test(`${p.id} - ${p.name}`, () => {
      const r = validateProgressionTemplate(p);
      if (!r.ok) {
        throw new Error(r.errors.join(", "));
      }
      expect(p.id).toBeTruthy();
      expect(p.roman.length).toBeGreaterThan(0);
      expect(p.functions.length).toBe(p.roman.length);
      expect(p.difficulty).toBeGreaterThanOrEqual(1);
      expect(p.difficulty).toBeLessThanOrEqual(5);
      expect(p.tags.length).toBeGreaterThan(0);
    });
  }
});
