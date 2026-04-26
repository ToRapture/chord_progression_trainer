import type {
  Exercise,
  ExerciseChoice,
  ExerciseGenerationOptions,
} from "./types";
import type { ProgressionTemplate } from "../progressions/types";
import {
  getAllProgressions,
  getProgressionsByGroup,
  type ProgressionGroupId,
} from "../progressions";
import { romanProgressionToChordSymbols } from "../harmony/chordSymbols";
import { getFunctionGroupsForProgression } from "../harmony/functionGroups";
import { pickConfusableDistractors, shuffleInPlace } from "./distractors";

let exerciseCounter = 0;
const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${++exerciseCounter}`;

function pickTemplate(
  opts: ExerciseGenerationOptions,
): ProgressionTemplate | null {
  const groupId = (opts.groupId ?? "all") as ProgressionGroupId;
  const pool = getProgressionsByGroup(groupId)
    .filter((t) => t.mode === opts.key.mode || t.mode === "both")
    .filter(
      (t) =>
        t.difficulty >= opts.difficultyRange[0] &&
        t.difficulty <= opts.difficultyRange[1],
    )
    .filter((t) => t.roman.every((r) => opts.allowedRomans.includes(r)));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateExercise(
  opts: ExerciseGenerationOptions,
): Exercise | null {
  switch (opts.exerciseType) {
    case "identify_progression":
      return generateIdentifyProgression(opts);
    case "fill_missing_chord":
      return generateFillMissingChord(opts);
    case "detect_replacement":
      return generateDetectReplacement(opts);
    case "identify_function":
    case "identify_bass_degrees":
      return null;
  }
}

function generateIdentifyProgression(
  opts: ExerciseGenerationOptions,
): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const correctChoice: ExerciseChoice = {
    id: "c-correct",
    label: tpl.roman.join(" - "),
    roman: tpl.roman,
    isCorrect: true,
  };
  const otherTemplates = getAllProgressions().filter(
    (t) =>
      t.id !== tpl.id &&
      t.roman.length === tpl.roman.length &&
      (t.mode === opts.key.mode || t.mode === "both") &&
      t.roman.every((r) => opts.allowedRomans.includes(r)),
  );
  shuffleInPlace(otherTemplates);
  const distractors = otherTemplates
    .slice(0, opts.choiceCount - 1)
    .map(
      (t, i): ExerciseChoice => ({
        id: `c-d${i}`,
        label: t.roman.join(" - "),
        roman: t.roman,
        isCorrect: false,
      }),
    );
  const choices = shuffleInPlace([correctChoice, ...distractors]);
  return {
    id: nextId("ex-id"),
    type: "identify_progression",
    key: opts.key,
    originalProgression: tpl.roman,
    renderedChords: romanProgressionToChordSymbols(tpl.roman, opts.key),
    choices,
    answerId: correctChoice.id,
    explanation: `${tpl.name}. Functions: ${getFunctionGroupsForProgression(
      tpl.roman,
      opts.key.mode,
    ).join("-")}.`,
    metadata: {
      difficulty: tpl.difficulty,
      tags: tpl.tags,
      instrumentPreset: opts.instrumentPreset,
    },
  };
}

function generateFillMissingChord(
  opts: ExerciseGenerationOptions,
): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const targetIndex =
    1 + Math.floor(Math.random() * Math.max(1, tpl.roman.length - 1));
  const target = tpl.roman[targetIndex];
  const promptProgression = tpl.roman.map((r, i) =>
    i === targetIndex ? null : r,
  );
  const distractors = pickConfusableDistractors(
    target,
    opts.key.mode,
    opts.allowedRomans,
    opts.choiceCount - 1,
  );
  const correctChoice: ExerciseChoice = {
    id: "c-correct",
    label: target,
    roman: [target],
    isCorrect: true,
  };
  const others = distractors.map(
    (d, i): ExerciseChoice => ({
      id: `c-d${i}`,
      label: d,
      roman: [d],
      isCorrect: false,
    }),
  );
  const choices = shuffleInPlace([correctChoice, ...others]);
  return {
    id: nextId("ex-fill"),
    type: "fill_missing_chord",
    key: opts.key,
    originalProgression: tpl.roman,
    renderedChords: romanProgressionToChordSymbols(tpl.roman, opts.key),
    promptProgression,
    targetIndex,
    choices,
    answerId: correctChoice.id,
    explanation: `Missing chord at position ${targetIndex + 1} is ${target}. From "${tpl.name}".`,
    metadata: {
      difficulty: tpl.difficulty,
      tags: tpl.tags,
      instrumentPreset: opts.instrumentPreset,
    },
  };
}

function generateDetectReplacement(
  opts: ExerciseGenerationOptions,
): Exercise | null {
  const tpl = pickTemplate(opts);
  if (!tpl) return null;
  const targetIndex = Math.floor(Math.random() * tpl.roman.length);
  const original = tpl.roman[targetIndex];
  const replacementCandidates = pickConfusableDistractors(
    original,
    opts.key.mode,
    opts.allowedRomans,
    1,
  );
  if (!replacementCandidates.length) return null;
  const replacement = replacementCandidates[0];
  const replaced = tpl.roman.map((r, i) =>
    i === targetIndex ? replacement : r,
  );
  const correctChoice: ExerciseChoice = {
    id: "c-correct",
    label: `Position ${targetIndex + 1}`,
    roman: [replacement],
    isCorrect: true,
  };
  const otherIndices = tpl.roman
    .map((_, i) => i)
    .filter((i) => i !== targetIndex);
  shuffleInPlace(otherIndices);
  const distractors = otherIndices
    .slice(0, opts.choiceCount - 1)
    .map(
      (i, k): ExerciseChoice => ({
        id: `c-d${k}`,
        label: `Position ${i + 1}`,
        isCorrect: false,
      }),
    );
  const choices = shuffleInPlace([correctChoice, ...distractors]);
  return {
    id: nextId("ex-rep"),
    type: "detect_replacement",
    key: opts.key,
    originalProgression: replaced,
    renderedChords: romanProgressionToChordSymbols(replaced, opts.key),
    targetIndex,
    choices,
    answerId: correctChoice.id,
    explanation: `Original "${tpl.name}" had ${original} at position ${
      targetIndex + 1
    }; it was replaced with ${replacement}.`,
    metadata: {
      difficulty: tpl.difficulty,
      tags: tpl.tags,
      instrumentPreset: opts.instrumentPreset,
    },
  };
}
