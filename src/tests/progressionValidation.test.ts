import { describe, expect, it } from "vitest";
import { validateProgressionTemplate } from "../core/harmony/validateProgression";
import { progressionLibrary } from "../core/progressions";

describe("progression library validation", () => {
  it("contains well-formed templates", () => {
    expect(progressionLibrary.length).toBeGreaterThanOrEqual(60);
    for (const template of progressionLibrary) {
      expect(template.id).toBeTruthy();
      expect(template.roman.length).toBeGreaterThan(0);
      expect(template.functions).toHaveLength(template.roman.length);
      expect(template.difficulty).toBeGreaterThanOrEqual(1);
      expect(template.difficulty).toBeLessThanOrEqual(5);
      expect(validateProgressionTemplate(template).valid).toBe(true);
    }
  });
});
