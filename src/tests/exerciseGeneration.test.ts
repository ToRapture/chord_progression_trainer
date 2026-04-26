import { describe, expect, test } from "vitest";
import { generateExercise } from "../core/exercises/generateExercise";
import { getDefaultVocabulary } from "../core/harmony/keys";
import type { ExerciseGenerationOptions } from "../core/exercises/types";

const baseOpts: Omit<ExerciseGenerationOptions, "exerciseType"> = {
  key: { tonic: "C", mode: "major" },
  allowedRomans: getDefaultVocabulary("major"),
  difficultyRange: [1, 5],
  groupId: "all",
  instrumentPreset: "piano_clear",
  choiceCount: 4,
};

describe("Exercise generation", () => {
  test("identify_progression yields exercise with correct answer in choices", () => {
    const ex = generateExercise({
      ...baseOpts,
      exerciseType: "identify_progression",
    });
    expect(ex).toBeTruthy();
    if (!ex) return;
    expect(ex.choices.find((c) => c.id === ex.answerId)).toBeTruthy();
    expect(ex.choices.length).toBeLessThanOrEqual(4);
    expect(ex.renderedChords.length).toBe(ex.originalProgression.length);
  });

  test("fill_missing_chord has targetIndex and exactly one null in promptProgression", () => {
    const ex = generateExercise({
      ...baseOpts,
      exerciseType: "fill_missing_chord",
    });
    expect(ex).toBeTruthy();
    if (!ex) return;
    expect(typeof ex.targetIndex).toBe("number");
    expect(ex.promptProgression?.filter((x) => x === null).length).toBe(1);
  });

  test("detect_replacement targetIndex within range", () => {
    const ex = generateExercise({
      ...baseOpts,
      exerciseType: "detect_replacement",
    });
    if (!ex) return;
    expect(ex.targetIndex).toBeGreaterThanOrEqual(0);
    expect(ex.targetIndex!).toBeLessThan(ex.originalProgression.length);
  });

  test("identify_function returns null (not implemented)", () => {
    const ex = generateExercise({
      ...baseOpts,
      exerciseType: "identify_function",
    });
    expect(ex).toBeNull();
  });

  test("identify_bass_degrees returns null (not implemented)", () => {
    const ex = generateExercise({
      ...baseOpts,
      exerciseType: "identify_bass_degrees",
    });
    expect(ex).toBeNull();
  });

  test("Returns null when no progression matches options", () => {
    const ex = generateExercise({
      ...baseOpts,
      key: { tonic: "C", mode: "major" },
      allowedRomans: ["I"],
      exerciseType: "identify_progression",
    });
    expect(ex).toBeNull();
  });
});
