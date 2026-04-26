import type { Exercise } from "./types";

export type ScoreResult = {
  correct: boolean;
  explanation: string;
};

export function scoreExercise(exercise: Exercise, choiceId: string): ScoreResult {
  const selected = exercise.choices.find((choice) => choice.id === choiceId);
  if (!selected) return { correct: false, explanation: "No matching choice was selected." };
  return {
    correct: selected.id === exercise.answerId,
    explanation: selected.id === exercise.answerId ? `Correct. ${exercise.explanation}` : `Not quite. ${exercise.explanation}`,
  };
}
