export interface ExerciseResult {
  exerciseId: string;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
  timestamp: number;
}

export function checkAnswer(
  exerciseId: string,
  selectedChoiceId: string,
  correctChoiceId: string
): ExerciseResult {
  const result: ExerciseResult = {
    exerciseId,
    selectedChoiceId,
    correctChoiceId,
    isCorrect: selectedChoiceId === correctChoiceId,
    timestamp: Date.now(),
  };
  recordResult(result);
  return result;
}

let history: ExerciseResult[] = [];
let historySeq = 0;

export function recordResult(result: ExerciseResult): void {
  historySeq++;
  history.push(result);
}

export function getHistory(): ExerciseResult[] {
  return [...history];
}

export function getScore(): { correct: number; total: number; percentage: number } {
  const total = history.length;
  const correct = history.filter((r) => r.isCorrect).length;
  return {
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}

export function resetScore(): void {
  history = [];
  historySeq = 0;
}
