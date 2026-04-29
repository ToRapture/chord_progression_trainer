import { describe, expect, it } from "vitest";
import {
  CHOICE_COUNT_OPTIONS,
  DIFFICULTY_OPTIONS,
  TEMPO_OPTIONS,
  applyDifficultyMaxChange,
  applyDifficultyMinChange,
} from "../app/trainerControlOptions";

describe("trainer control options", () => {
  it("uses fixed dropdown values for numeric trainer settings", () => {
    expect(DIFFICULTY_OPTIONS).toEqual([1, 2, 3, 4, 5]);
    expect(CHOICE_COUNT_OPTIONS).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(TEMPO_OPTIONS).toEqual([40, 50, 60, 72, 84, 96, 108, 120, 132, 144, 160, 180, 200, 220, 240]);
  });

  it("raises max when difficulty min is changed above the current max", () => {
    expect(applyDifficultyMinChange(4, 2)).toEqual({ min: 4, max: 4 });
  });

  it("lowers min when difficulty max is changed below the current min", () => {
    expect(applyDifficultyMaxChange(4, 2)).toEqual({ min: 2, max: 2 });
  });
});
