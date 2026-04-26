import type { Exercise } from "./types";

export type ScoredAnswer = {
  correct: boolean;
  explanation: string;
};

export function scoreAnswer(exercise: Exercise, choiceId: string): ScoredAnswer {
  const correct = exercise.answerId === choiceId;
  return { correct, explanation: exercise.explanation };
}
