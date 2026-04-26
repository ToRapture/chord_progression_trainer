import { functionSequence } from "../harmony/functionGroups";
import { renderRomanProgression, romanScaleDegree } from "../harmony/roman";
import { getProgressionsByGroup, progressionLibrary } from "../progressions";
import type { ProgressionTemplate } from "../progressions/types";
import { choiceId, nearestProgressionDistractors, shuffle, singleChordDistractors } from "./distractors";
import type { Exercise, ExerciseChoice, ExerciseGenerationOptions } from "./types";

function compatibleTemplates(options: ExerciseGenerationOptions): ProgressionTemplate[] {
  const group = options.progressionGroup && options.progressionGroup !== "all" ? getProgressionsByGroup(options.progressionGroup as never) : progressionLibrary;
  const [min, max] = options.difficultyRange;
  return group.filter((template) => {
    const modeMatch = template.mode === "both" || template.mode === options.key.mode;
    const difficultyMatch = template.difficulty >= min && template.difficulty <= max;
    const romanMatch = template.roman.every((roman) => options.allowedRomans.includes(roman));
    const tagMatch = !options.tags?.length || options.tags.some((tag) => template.tags.includes(tag));
    return modeMatch && difficultyMatch && romanMatch && tagMatch;
  });
}

function pickTemplate(options: ExerciseGenerationOptions): ProgressionTemplate {
  const candidates = compatibleTemplates(options);
  if (!candidates.length) throw new Error("No progression template matches the current settings.");
  return shuffle(candidates)[0];
}

function baseExercise(answer: ProgressionTemplate, options: ExerciseGenerationOptions): Omit<Exercise, "choices" | "answerId" | "explanation"> {
  return {
    id: `${options.exerciseType}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type: options.exerciseType,
    key: options.key,
    originalProgression: answer.roman,
    renderedChords: renderRomanProgression(answer.roman, options.key),
    metadata: {
      difficulty: answer.difficulty,
      tags: answer.tags,
      instrumentPreset: options.instrumentPreset,
    },
  };
}

function identifyProgression(options: ExerciseGenerationOptions): Exercise {
  const answer = pickTemplate(options);
  const candidates = compatibleTemplates(options);
  const distractors = nearestProgressionDistractors(answer, candidates, options.choiceCount - 1);
  const choices = shuffle([answer, ...distractors]).map<ExerciseChoice>((template, index) => ({
    id: choiceId("progression", index),
    label: template.roman.join(" - "),
    roman: template.roman,
    functions: template.functions,
    bassDegrees: template.roman.map(romanScaleDegree),
    isCorrect: template.id === answer.id,
  }));
  return {
    ...baseExercise(answer, options),
    choices,
    answerId: choices.find((choice) => choice.isCorrect)?.id ?? choices[0].id,
    explanation: `${answer.roman.join(" - ")} renders as ${renderRomanProgression(answer.roman, options.key).join(" - ")}.`,
  };
}

function fillMissingChord(options: ExerciseGenerationOptions): Exercise {
  const answer = pickTemplate(options);
  const targetIndex = answer.roman.length <= 3 ? Math.max(0, answer.roman.length - 2) : Math.floor(Math.random() * (answer.roman.length - 1));
  const correctRoman = answer.roman[targetIndex];
  const promptProgression = answer.roman.map((roman, index) => (index === targetIndex ? null : roman));
  const distractors = singleChordDistractors(correctRoman, options.allowedRomans, options.choiceCount - 1);
  const choices = shuffle([correctRoman, ...distractors]).slice(0, options.choiceCount).map<ExerciseChoice>((roman, index) => ({
    id: choiceId("missing", index),
    label: roman,
    roman: [roman],
    functions: functionSequence([roman], options.key.mode),
    bassDegrees: [romanScaleDegree(roman)],
    isCorrect: roman === correctRoman,
  }));
  return {
    ...baseExercise(answer, options),
    promptProgression,
    targetIndex,
    choices,
    answerId: choices.find((choice) => choice.isCorrect)?.id ?? choices[0].id,
    explanation: `The missing chord is ${correctRoman}; its bass degree is ${romanScaleDegree(correctRoman)} and its function is ${functionSequence([correctRoman], options.key.mode)[0]}.`,
  };
}

function detectReplacement(options: ExerciseGenerationOptions): Exercise {
  const answer = pickTemplate(options);
  const targetIndex = Math.floor(Math.random() * answer.roman.length);
  const originalRoman = answer.roman[targetIndex];
  const replacements = singleChordDistractors(originalRoman, options.allowedRomans, options.choiceCount - 1);
  const playedRoman = replacements[0] ?? originalRoman;
  const playedProgression = answer.roman.map((roman, index) => (index === targetIndex ? playedRoman : roman));
  const choices = shuffle([playedRoman, ...replacements.slice(1)]).slice(0, options.choiceCount).map<ExerciseChoice>((roman, index) => ({
    id: choiceId("replacement", index),
    label: `Position ${targetIndex + 1}: ${roman}`,
    roman: [roman],
    functions: functionSequence([roman], options.key.mode),
    bassDegrees: [romanScaleDegree(roman)],
    isCorrect: roman === playedRoman,
  }));
  return {
    ...baseExercise(answer, options),
    playedProgression,
    targetIndex,
    choices,
    answerId: choices.find((choice) => choice.isCorrect)?.id ?? choices[0].id,
    explanation: `Position ${targetIndex + 1} was played as ${playedRoman} instead of ${originalRoman}.`,
  };
}

function identifyFunction(options: ExerciseGenerationOptions): Exercise {
  const answer = pickTemplate(options);
  const correct = functionSequence(answer.roman, options.key.mode);
  const variants = nearestProgressionDistractors(answer, compatibleTemplates(options), options.choiceCount - 1).map((template) => template.functions);
  const choices = shuffle([correct, ...variants]).slice(0, options.choiceCount).map<ExerciseChoice>((functions, index) => ({
    id: choiceId("function", index),
    label: functions.join(" - "),
    functions,
    isCorrect: functions.join("|") === correct.join("|"),
  }));
  return {
    ...baseExercise(answer, options),
    choices,
    answerId: choices.find((choice) => choice.isCorrect)?.id ?? choices[0].id,
    explanation: `The function sequence is ${correct.join(" - ")}.`,
  };
}

function identifyBassDegrees(options: ExerciseGenerationOptions): Exercise {
  const answer = pickTemplate(options);
  const correct = answer.roman.map(romanScaleDegree);
  const variants = nearestProgressionDistractors(answer, compatibleTemplates(options), options.choiceCount - 1).map((template) => template.roman.map(romanScaleDegree));
  const choices = shuffle([correct, ...variants]).slice(0, options.choiceCount).map<ExerciseChoice>((bassDegrees, index) => ({
    id: choiceId("bass", index),
    label: bassDegrees.join(" - "),
    bassDegrees,
    isCorrect: bassDegrees.join("|") === correct.join("|"),
  }));
  return {
    ...baseExercise(answer, options),
    choices,
    answerId: choices.find((choice) => choice.isCorrect)?.id ?? choices[0].id,
    explanation: `The bass degree sequence is ${correct.join(" - ")}.`,
  };
}

export function generateExercise(options: ExerciseGenerationOptions): Exercise {
  switch (options.exerciseType) {
    case "identify_progression":
      return identifyProgression(options);
    case "fill_missing_chord":
      return fillMissingChord(options);
    case "detect_replacement":
      return detectReplacement(options);
    case "identify_function":
      return identifyFunction(options);
    case "identify_bass_degrees":
      return identifyBassDegrees(options);
  }
}
