import { functionSequence } from "../harmony/functionGroups";
import type { ProgressionTemplate } from "./types";

function p(id: string, name: string, roman: string[], difficulty: 1 | 2 | 3 | 4 | 5, tags: string[], description: string): ProgressionTemplate {
  return { id, name, mode: "major", roman, functions: functionSequence(roman, "major"), difficulty, tags: ["pop", ...tags], description, cadence: "loop" };
}

export const popProgressions: ProgressionTemplate[] = [
  p("pop-001", "I V vi IV", ["I", "V", "vi", "IV"], 1, ["loop"], "Modern four-chord pop loop."),
  p("pop-002", "vi IV I V", ["vi", "IV", "I", "V"], 1, ["loop"], "Relative minor start of the axis progression."),
  p("pop-003", "I vi IV V", ["I", "vi", "IV", "V"], 1, ["loop"], "Classic pop and doo-wop loop."),
  p("pop-004", "Eight bar pop", ["I", "V", "vi", "iii", "IV", "I", "IV", "V"], 3, ["extended"], "A longer pop phrase with iii color."),
  p("pop-005", "I V IV V", ["I", "V", "IV", "V"], 1, ["loop"], "Dominant and subdominant alternation."),
  p("pop-006", "I IV V IV", ["I", "IV", "V", "IV"], 1, ["rock"], "Rock-oriented IV-V-IV motion."),
  p("pop-007", "bVII rock", ["I", "bVII", "IV", "I"], 3, ["rock", "borrowed"], "Borrowed bVII backdoor color."),
  p("pop-008", "Passing V", ["I", "V", "vi", "V"], 2, ["loop"], "Dominant frames the deceptive vi."),
  p("pop-009", "iii color", ["I", "iii", "vi", "IV"], 2, ["loop"], "Tonic substitute chain into IV."),
  p("pop-010", "Pop ii V", ["I", "vi", "ii", "V"], 2, ["cadence"], "Pop loop with classical ii-V close."),
  p("pop-011", "IV I V vi", ["IV", "I", "V", "vi"], 2, ["loop"], "Starts on predominant color."),
  p("pop-012", "vi V IV V", ["vi", "V", "IV", "V"], 2, ["loop"], "Minor start with repeated dominant returns."),
  p("pop-013", "I IV vi V", ["I", "IV", "vi", "V"], 2, ["loop"], "Balances IV and vi before dominant."),
  p("pop-014", "I V ii IV", ["I", "V", "ii", "IV"], 2, ["loop"], "Dominant to ii with IV support."),
  p("pop-015", "vi ii IV V", ["vi", "ii", "IV", "V"], 3, ["loop"], "Begins in tonic substitute before predominant chain."),
  p("pop-016", "I bVII vi IV", ["I", "bVII", "vi", "IV"], 4, ["borrowed"], "Borrowed bVII placed inside a pop loop."),
  p("pop-017", "I V vi IV V", ["I", "V", "vi", "IV", "V"], 2, ["extended"], "Four-chord loop with a dominant tag."),
];
