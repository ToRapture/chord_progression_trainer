import { Exercise, ExerciseChoice, ExerciseGenerationOptions } from "./types";
import { ProgressionTemplate } from "../progressions/types";
import {
  getProgressionsByMode,
  getProgressionsByDifficulty,
  getProgressionsByTags,
  getProgressionsByAllowedRomans,
  getProgressionsByGroup,
} from "../progressions/index";
import { progressionToChordSymbols } from "../harmony/roman";
import { getFunctionGroup } from "../harmony/functionGroups";
import {
  generateDistractorProgressions,
  generateFillInDistractorChoices,
  createChoiceFromRoman,
  createProgressionChoice,
} from "./distractors";
import { RomanNumeralSymbol } from "../harmony/types";

let exerciseCounter = 0;

function generateId(): string {
  exerciseCounter++;
  return `ex_${Date.now()}_${exerciseCounter}`;
}

function selectProgression(
  options: ExerciseGenerationOptions
): ProgressionTemplate {
  let pool = getProgressionsByMode(options.key.mode);

  if (options.progressionGroup) {
    pool = getProgressionsByGroup(options.progressionGroup);
  }

  pool = pool.filter(
    (p) =>
      p.difficulty >= options.difficultyRange[0] &&
      p.difficulty <= options.difficultyRange[1]
  );

  if (options.tags && options.tags.length > 0) {
    pool = pool.filter((p) =>
      options.tags!.some((t) => p.tags.includes(t))
    );
  }

  pool = pool.filter((p) =>
    p.roman.every((r) => {
      const base = r.replace(/7|maj7|m7|°|ø|m/g, "");
      return options.allowedRomans.some(
        (a) =>
          a.replace(/7|maj7|m7|°|ø|m/g, "") === base || a === r
      );
    })
  );

  if (pool.length === 0) {
    pool = getProgressionsByMode(options.key.mode);
    pool = pool.filter(
      (p) =>
        p.difficulty >= options.difficultyRange[0] &&
        p.difficulty <= options.difficultyRange[1]
    );
  }

  if (pool.length === 0) {
    pool = getProgressionsByMode(options.key.mode);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function generateIdentifyProgressionExercise(
  options: ExerciseGenerationOptions
): Exercise {
  const source = selectProgression(options);
  const distractors = generateDistractorProgressions(
    source,
    options.choiceCount - 1,
    options.key.mode,
    options.allowedRomans
  );

  const correctChoice = createProgressionChoice("correct", source, true);
  const distractorChoices = distractors.map((d, i) =>
    createProgressionChoice(`dist_${i}`, d, false)
  );

  const choices = shuffle([
    correctChoice,
    ...distractorChoices.slice(0, options.choiceCount - 1),
  ]);

  return {
    id: generateId(),
    type: "identify_progression",
    key: options.key,
    sourceProgression: source,
    renderedChords: progressionToChordSymbols(source.roman, options.key),
    prompt: `Identify the chord progression you hear. Key: ${options.key.tonic} ${options.key.mode}`,
    choices,
    answerChoiceId: correctChoice.id,
    explanation: `The correct progression is ${source.roman.join(" → ")} (${progressionToChordSymbols(source.roman, options.key).join(" → ")}). ${source.description || ""} Function groups: ${source.functions.join(" → ")}.`,
  };
}

function generateFillMissingChordExercise(
  options: ExerciseGenerationOptions
): Exercise {
  const source = selectProgression(options);

  if (source.roman.length < 3) {
    return generateIdentifyProgressionExercise(options);
  }

  const targetIndex = Math.floor(Math.random() * (source.roman.length - 2)) + 1;
  const correctRoman = source.roman[targetIndex];

  const distractorRomans = generateFillInDistractorChoices(
    correctRoman,
    options.key.mode,
    options.choiceCount - 1
  );

  const correctChoice = createChoiceFromRoman(
    "correct",
    correctRoman,
    true,
    options.key.mode
  );

  const distractorChoices = distractorRomans.map((r, i) =>
    createChoiceFromRoman(`dist_${i}`, r, false, options.key.mode)
  );

  const choices = shuffle([
    correctChoice,
    ...distractorChoices.slice(0, options.choiceCount - 1),
  ]);

  const promptProgression = source.roman.map((r, i) =>
    i === targetIndex ? null : r
  ) as (RomanNumeralSymbol | null)[];

  const renderedWithGap = progressionToChordSymbols(
    source.roman,
    options.key
  );
  renderedWithGap[targetIndex] = "?";

  return {
    id: generateId(),
    type: "fill_missing_chord",
    key: options.key,
    sourceProgression: source,
    renderedChords: renderedWithGap,
    prompt: `What chord fills the gap? Key: ${options.key.tonic} ${options.key.mode}`,
    promptProgression,
    targetIndex,
    choices,
    answerChoiceId: correctChoice.id,
    explanation: `The missing chord is ${correctRoman}. The full progression is ${source.roman.join(" → ")} (${progressionToChordSymbols(source.roman, options.key).join(" → ")}). Function: ${getFunctionGroup(correctRoman, options.key.mode)}.`,
  };
}

function generateDetectReplacementExercise(
  options: ExerciseGenerationOptions
): Exercise {
  const source = selectProgression(options);

  if (source.roman.length < 3) {
    return generateIdentifyProgressionExercise(options);
  }

  const targetIndex = Math.floor(Math.random() * source.roman.length);
  const original = source.roman[targetIndex];

  const distractorRomans = generateFillInDistractorChoices(
    original,
    options.key.mode,
    2
  );

  const replacement = distractorRomans[0] ?? (options.key.mode === "major" ? "IV" : "iv");

  const correctLabel = `Replaced chord: ${original} (original)`;
  const distractorLabel = `Replaced chord: ${replacement} (different)`;

  const correctChoice: ExerciseChoice = {
    id: "correct",
    label: correctLabel,
    roman: [original],
    isCorrect: true,
  };

  const distractorChoice: ExerciseChoice = {
    id: "dist_0",
    label: distractorLabel,
    roman: [replacement],
    isCorrect: false,
  };

  const choices = shuffle([correctChoice, distractorChoice]);

  const replacedChords = progressionToChordSymbols(source.roman, options.key);

  return {
    id: generateId(),
    type: "detect_replacement",
    key: options.key,
    sourceProgression: source,
    renderedChords: replacedChords,
    prompt: `A chord in the progression has been replaced. Which chord was replaced and what was the replacement? Listen carefully. Key: ${options.key.tonic} ${options.key.mode}`,
    promptProgression: source.roman.map((r, i) =>
      i === targetIndex ? null : r
    ),
    targetIndex,
    choices,
    answerChoiceId: correctChoice.id,
    explanation: `The chord at position ${targetIndex + 1} was replaced. Original: ${original}, Replacement: ${replacement}. The original is ${original === "vi" ? "a tonic substitute" : original === "IV" ? "a predominant" : "diatonic"}.`,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateExercise(
  options: ExerciseGenerationOptions
): Exercise {
  switch (options.exerciseType) {
    case "identify_progression":
      return generateIdentifyProgressionExercise(options);
    case "fill_missing_chord":
      return generateFillMissingChordExercise(options);
    case "detect_replacement":
      return generateDetectReplacementExercise(options);
    default:
      return generateIdentifyProgressionExercise(options);
  }
}

export function generateMultipleExercises(
  options: ExerciseGenerationOptions,
  count: number
): Exercise[] {
  const exercises: Exercise[] = [];
  for (let i = 0; i < count; i++) {
    exercises.push(generateExercise(options));
  }
  return exercises;
}
