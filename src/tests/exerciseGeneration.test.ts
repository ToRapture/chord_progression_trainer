import { describe, it, expect } from "vitest";
import { generateExercise } from "../core/exercises/generateExercise";
import { ExerciseGenerationOptions } from "../core/exercises/types";
import { checkAnswer, getScore, resetScore } from "../core/exercises/scoring";
import { generateFillInDistractorChoices } from "../core/exercises/distractors";
import { MAJOR_DIATONIC_ROMANS, MINOR_DIATONIC_ROMANS } from "../core/harmony/functionGroups";

describe("Exercise Generation - Identify Progression", () => {
  it("generates an exercise with correct structure", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "identify_progression",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    expect(ex.id).toBeTruthy();
    expect(ex.type).toBe("identify_progression");
    expect(ex.key).toEqual({ tonic: "C", mode: "major" });
    expect(ex.sourceProgression).toBeTruthy();
    expect(ex.renderedChords.length).toBeGreaterThan(0);
    expect(ex.prompt).toBeTruthy();
    expect(ex.choices.length).toBe(4);
    expect(ex.answerChoiceId).toBeTruthy();
    expect(ex.explanation).toBeTruthy();
  });

  it("answer choice is in choices", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "identify_progression",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    const answerChoice = ex.choices.find((c) => c.id === ex.answerChoiceId);
    expect(answerChoice).toBeTruthy();
    expect(answerChoice!.isCorrect).toBe(true);
  });

  it("exactly one choice is correct", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "identify_progression",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    const correctCount = ex.choices.filter((c) => c.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  it("works in minor key", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "A", mode: "minor" },
      allowedRomans: MINOR_DIATONIC_ROMANS,
      exerciseType: "identify_progression",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    expect(ex.id).toBeTruthy();
    expect(ex.sourceProgression.mode).toBe("minor");
  });
});

describe("Exercise Generation - Fill Missing Chord", () => {
  it("generates a fill-in exercise", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "fill_missing_chord",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    expect(ex.type).toBe("fill_missing_chord");

    if (ex.type === "fill_missing_chord") {
      expect(ex.targetIndex).toBeDefined();
      expect(ex.promptProgression).toBeDefined();
      const nullCount = ex.promptProgression!.filter((r) => r === null).length;
      expect(nullCount).toBe(1);
    }
  });

  it("answer choice exists", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "fill_missing_chord",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    const answerChoice = ex.choices.find((c) => c.id === ex.answerChoiceId);
    expect(answerChoice).toBeTruthy();
    expect(answerChoice!.isCorrect).toBe(true);
  });

  it("works in minor key", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "A", mode: "minor" },
      allowedRomans: MINOR_DIATONIC_ROMANS,
      exerciseType: "fill_missing_chord",
      difficultyRange: [1, 3],
      choiceCount: 4,
    };

    const ex = generateExercise(options);
    expect(ex.key).toEqual({ tonic: "A", mode: "minor" });
  });
});

describe("Exercise Generation - Detect Replacement", () => {
  it("generates a replacement exercise", () => {
    const options: ExerciseGenerationOptions = {
      key: { tonic: "C", mode: "major" },
      allowedRomans: MAJOR_DIATONIC_ROMANS,
      exerciseType: "detect_replacement",
      difficultyRange: [1, 3],
      choiceCount: 2,
    };

    const ex = generateExercise(options);
    expect(ex.type).toBe("detect_replacement");
    expect(ex.targetIndex).toBeDefined();
    expect(ex.choices.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Distractor Generation", () => {
  it("generates distractor chords for fill-in", () => {
    const distractors = generateFillInDistractorChoices("vi", "major", 3);
    expect(distractors.length).toBeGreaterThanOrEqual(1);
    expect(distractors).not.toContain("vi");
  });

  it("generates distractors from same function group", () => {
    const distractors = generateFillInDistractorChoices("IV", "major", 3);
    const functions = distractors.map((r) => r);
    expect(functions.length).toBeGreaterThanOrEqual(1);
  });

  it("minor distractor generation works", () => {
    const distractors = generateFillInDistractorChoices("iv", "minor", 3);
    expect(distractors.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Scoring", () => {
  it("records correct answer", () => {
    resetScore();
    const result = checkAnswer("ex1", "choice_a", "choice_a");
    expect(result.isCorrect).toBe(true);

    const score = getScore();
    expect(score.correct).toBe(1);
    expect(score.total).toBe(1);
    expect(score.percentage).toBe(100);
  });

  it("records incorrect answer", () => {
    resetScore();
    checkAnswer("ex1", "choice_a", "choice_b");

    const score = getScore();
    expect(score.correct).toBe(0);
    expect(score.total).toBe(1);
    expect(score.percentage).toBe(0);
  });

  it("tracks multiple results", () => {
    resetScore();
    checkAnswer("ex1", "a", "a");
    checkAnswer("ex2", "b", "a");
    checkAnswer("ex3", "c", "c");

    const score = getScore();
    expect(score.correct).toBe(2);
    expect(score.total).toBe(3);
    expect(score.percentage).toBe(67);
  });

  it("resets score", () => {
    checkAnswer("ex1", "a", "a");
    resetScore();
    const score = getScore();
    expect(score.total).toBe(0);
    expect(score.percentage).toBe(0);
  });
});
