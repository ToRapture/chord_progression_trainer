import { VoicedChord, VoicingCandidate, VoicingPolicy, MidiNote } from "./types";
import { getChordPitchClasses } from "./pitchUtils";
import * as Tonal from "tonal";

export function scoreVoicingCandidate(
  previous: VoicedChord | null,
  candidate: VoicingCandidate,
  policy: VoicingPolicy,
  chordSymbol: string
): number {
  let score = 0;

  if (previous) {
    const totalMovement = totalUpperVoiceMovement(previous.upperVoices, candidate.upperVoices);
    score += totalMovement * 1.0;

    const leapPenalty = largeLeapPenalty(previous.upperVoices, candidate.upperVoices, policy.maxUpperVoiceLeap);
    score += leapPenalty * 2.0;
  }

  score += rangePenalty(candidate, policy) * 3.0;
  score += muddyLowIntervalPenalty(candidate) * 3.0;
  score += missingThirdPenalty(candidate, chordSymbol) * 5.0;
  score += badBassPenalty(candidate, policy, chordSymbol) * 4.0;

  return score;
}

function totalUpperVoiceMovement(
  previousUpper: MidiNote[],
  candidateUpper: MidiNote[]
): number {
  const minLen = Math.min(previousUpper.length, candidateUpper.length);
  let total = 0;
  for (let i = 0; i < minLen; i++) {
    total += Math.abs(candidateUpper[i] - previousUpper[i]);
  }
  return total;
}

function largeLeapPenalty(
  previousUpper: MidiNote[],
  candidateUpper: MidiNote[],
  maxLeap: number
): number {
  let penalty = 0;
  const minLen = Math.min(previousUpper.length, candidateUpper.length);
  for (let i = 0; i < minLen; i++) {
    const leap = Math.abs(candidateUpper[i] - previousUpper[i]);
    if (leap > maxLeap) {
      penalty += leap - maxLeap;
    }
  }
  return penalty;
}

function rangePenalty(candidate: VoicingCandidate, policy: VoicingPolicy): number {
  let penalty = 0;

  if (candidate.bass < policy.bassRange[0]) {
    penalty += policy.bassRange[0] - candidate.bass;
  }
  if (candidate.bass > policy.bassRange[1]) {
    penalty += candidate.bass - policy.bassRange[1];
  }

  for (const v of candidate.upperVoices) {
    if (v < policy.upperRange[0]) {
      penalty += policy.upperRange[0] - v;
    }
    if (v > policy.upperRange[1]) {
      penalty += v - policy.upperRange[1];
    }
    if (v <= candidate.bass) {
      penalty += 6;
    }
  }

  return penalty;
}

function muddyLowIntervalPenalty(candidate: VoicingCandidate): number {
  let penalty = 0;

  const lowVoices = [candidate.bass, ...candidate.upperVoices].filter(
    (v) => v <= 48
  );

  for (let i = 0; i < lowVoices.length; i++) {
    for (let j = i + 1; j < lowVoices.length; j++) {
      const interval = Math.abs(lowVoices[j] - lowVoices[i]);
      if (interval >= 3 && interval <= 4 && lowVoices[i] <= 40) {
        penalty += 1;
      }
    }
  }

  return penalty;
}

function missingThirdPenalty(
  candidate: VoicingCandidate,
  chordSymbol: string
): number {
  const pitchClasses = getChordPitchClasses(chordSymbol);
  if (pitchClasses.length < 2) return 0;

  const thirdPC = pitchClasses[1];
  const allMidi = [candidate.bass, ...candidate.upperVoices];

  const hasThird = allMidi.some((midi) => {
    const note = Tonal.Note.fromMidi(midi);
    return note ? note.startsWith(thirdPC) : false;
  });

  return hasThird ? 0 : 1;
}

function badBassPenalty(
  candidate: VoicingCandidate,
  policy: VoicingPolicy,
  chordSymbol: string
): number {
  if (!policy.preferRootBass) return 0;

  const pitchClasses = getChordPitchClasses(chordSymbol);
  if (pitchClasses.length === 0) return 0;

  const rootPC = pitchClasses[0];
  const bassNote = Tonal.Note.fromMidi(candidate.bass);
  if (!bassNote) return 1;

  return bassNote.startsWith(rootPC) ? 0 : 1;
}

export function keepCommonTones(
  previousUpper: MidiNote[],
  candidateUpper: MidiNote[]
): boolean {
  const prevPCs = previousUpper.map((m) => Tonal.Note.fromMidi(m)?.replace(/\d/g, ""));
  const candPCs = candidateUpper.map((m) => Tonal.Note.fromMidi(m)?.replace(/\d/g, ""));

  return prevPCs.some((pc) => pc && candPCs.includes(pc));
}
