import { functionSequence } from "../harmony/functionGroups";
import type { ProgressionTemplate } from "./types";

function p(id: string, name: string, roman: string[], difficulty: 1 | 2 | 3 | 4 | 5, tags: string[], description: string): ProgressionTemplate {
  return { id, name, mode: "major", roman, functions: functionSequence(roman, "major"), difficulty, tags: ["jazz", ...tags], description, cadence: "authentic" };
}

export const jazzBasicProgressions: ProgressionTemplate[] = [
  p("jazz-001", "ii V I", ["ii7", "V7", "Imaj7"], 3, ["cadence"], "Core major jazz cadence."),
  p("jazz-002", "I vi ii V", ["Imaj7", "vi7", "ii7", "V7"], 3, ["turnaround"], "Basic major turnaround."),
  p("jazz-003", "iii vi ii V", ["iii7", "vi7", "ii7", "V7"], 4, ["turnaround"], "Cycle-style turnaround."),
  p("jazz-004", "I VI7 ii V", ["Imaj7", "VI7", "ii7", "V7"], 4, ["secondary"], "Secondary dominant in a turnaround."),
  p("jazz-005", "ii V iii vi", ["ii7", "V7", "iii7", "vi7"], 4, ["extended"], "Deceptive ii-V into iii-vi."),
  p("jazz-006", "Rhythm bridge tag", ["Imaj7", "IVmaj7", "viiø7", "III7", "vi7", "ii7", "V7", "Imaj7"], 5, ["extended"], "A compact introduction to longer jazz harmony."),
  p("jazz-007", "IV ii V I", ["IVmaj7", "ii7", "V7", "Imaj7"], 3, ["cadence"], "Starts from IV before ii-V-I."),
  p("jazz-008", "I ii V I", ["Imaj7", "ii7", "V7", "Imaj7"], 3, ["cadence"], "Tonic to ii-V-I."),
  p("jazz-009", "vi ii V I", ["vi7", "ii7", "V7", "Imaj7"], 3, ["cadence"], "Minor tonic substitute into ii-V-I."),
  p("jazz-010", "iii VI7 ii V", ["iii7", "VI7", "ii7", "V7"], 4, ["secondary"], "Secondary dominant strengthens the turnaround."),
  p("jazz-011", "I IV vii III", ["Imaj7", "IVmaj7", "viiø7", "III7"], 5, ["extended"], "First half of a circle-like jazz sequence."),
  p("jazz-012", "ii V I VI", ["ii7", "V7", "Imaj7", "VI7"], 4, ["turnaround"], "ii-V-I with turnaround dominant."),
];
