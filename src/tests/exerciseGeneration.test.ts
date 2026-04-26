import { describe, expect, it } from "vitest";
import { generateExercise } from "../core/exercises/generateExercise";
import type { ExerciseType } from "../core/exercises/types";
import { defaultVocabularyForMode } from "../core/harmony/keys";

const exerciseTypes: ExerciseType[] = [
  "identify_progression",
  "fill_missing_chord",
  "detect_replacement",
  "identify_function",
  "identify_bass_degrees",
];

describe("exercise generation", () => {
  it.each(exerciseTypes)("generates %s exercises with valid answers", (exerciseType) => {
    const exercise = generateExercise({
      key: { tonic: "C", mode: "major" },
      allowedRomans: defaultVocabularyForMode("major"),
      exerciseType,
      difficultyRange: [1, 3],
      instrumentPreset: "piano_clear",
      choiceCount: 4,
      progressionGroup: "all",
    });
    expect(exercise.choices.length).toBeGreaterThanOrEqual(2);
    expect(exercise.choices.length).toBeLessThanOrEqual(4);
    expect(exercise.choices.some((choice) => choice.id === exercise.answerId)).toBe(true);
    expect(exercise.choices.find((choice) => choice.id === exercise.answerId)?.isCorrect).toBe(true);
    if (exerciseType === "fill_missing_chord") expect(exercise.targetIndex).toBeTypeOf("number");
    if (exerciseType === "detect_replacement") expect(exercise.playedProgression).toBeDefined();
  });
});
