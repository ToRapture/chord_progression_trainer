export const DIFFICULTY_OPTIONS = [1, 2, 3, 4, 5];
export const CHOICE_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8];
export const TEMPO_OPTIONS = [40, 50, 60, 72, 84, 96, 108, 120, 132, 144, 160, 180, 200, 220, 240];

export function applyDifficultyMinChange(nextMin: number, currentMax: number): { min: number; max: number } {
  return { min: nextMin, max: Math.max(nextMin, currentMax) };
}

export function applyDifficultyMaxChange(currentMin: number, nextMax: number): { min: number; max: number } {
  return { min: Math.min(currentMin, nextMax), max: nextMax };
}
