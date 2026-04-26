import { functionSequence } from "../harmony/functionGroups";
import type { ProgressionTemplate } from "./types";

function p(id: string, name: string, roman: string[], difficulty: 1 | 2 | 3 | 4 | 5, tags: string[], description: string, cadence: ProgressionTemplate["cadence"]): ProgressionTemplate {
  return { id, name, mode: "major", roman, functions: functionSequence(roman, "major"), difficulty, tags: ["major", "basic", ...tags], description, cadence };
}

export const majorBasicProgressions: ProgressionTemplate[] = [
  p("maj-001", "Authentic cadence", ["I", "V", "I"], 1, ["cadence"], "A compact tonic-dominant-tonic cadence.", "authentic"),
  p("maj-002", "Primary cadence", ["I", "IV", "V", "I"], 1, ["cadence"], "Primary major triads with a clear dominant return.", "authentic"),
  p("maj-003", "ii-V-I", ["I", "ii", "V", "I"], 2, ["cadence"], "Pre-dominant ii leads into V and resolves to I.", "authentic"),
  p("maj-004", "Axis pop loop", ["I", "vi", "IV", "V"], 1, ["loop", "pop"], "A common tonic-submediant-predominant-dominant loop.", "loop"),
  p("maj-005", "Circle pop cadence", ["I", "vi", "ii", "V"], 2, ["circle"], "Descending functional motion from tonic area into dominant.", "half"),
  p("maj-006", "Plagal contrast", ["I", "IV", "I", "V"], 1, ["plagal"], "Alternates tonic and subdominant before a dominant ending.", "half"),
  p("maj-007", "Four chord pop", ["I", "V", "vi", "IV"], 1, ["pop", "loop"], "The common I-V-vi-IV progression.", "loop"),
  p("maj-008", "Mediant lift", ["I", "iii", "IV", "V"], 2, ["basic"], "Introduces iii as a tonic-function color.", "half"),
  p("maj-009", "vi opening loop", ["vi", "IV", "I", "V"], 2, ["pop", "loop"], "Starts from vi and resolves through IV-I-V.", "loop"),
  p("maj-010", "Backdoor contrast", ["I", "V", "IV", "I"], 1, ["basic"], "Dominant and subdominant contrast around tonic.", "plagal"),
  p("maj-011", "ii to IV lift", ["I", "ii", "IV", "V"], 2, ["basic"], "Two pre-dominant colors before V.", "half"),
  p("maj-012", "IV vi V", ["I", "IV", "vi", "V"], 2, ["basic"], "Places vi between subdominant and dominant.", "half"),
  p("maj-013", "vi iii IV", ["I", "vi", "iii", "IV"], 3, ["basic"], "Tonic-family substitutions before IV.", "none"),
  p("maj-014", "iii vi IV", ["I", "iii", "vi", "IV"], 3, ["basic"], "Mediant and submediant motion with a plagal color.", "plagal"),
  p("maj-015", "Extended authentic", ["I", "IV", "ii", "V", "I"], 2, ["cadence"], "IV and ii reinforce pre-dominant function.", "authentic"),
  p("maj-016", "Long circle cadence", ["I", "vi", "IV", "ii", "V", "I"], 3, ["cadence", "extended"], "Longer functional path back to tonic.", "authentic"),
  p("maj-017", "Deceptive cadence", ["I", "IV", "V", "vi"], 2, ["cadence"], "Dominant moves deceptively to vi.", "deceptive"),
  p("maj-018", "Half cadence", ["I", "vi", "IV", "V"], 1, ["cadence"], "Strong arrival on dominant at phrase end.", "half"),
  p("maj-019", "Tonic expansion", ["I", "vi", "I", "V"], 2, ["basic"], "Expands tonic area before dominant.", "half"),
  p("maj-020", "Subdominant return", ["I", "ii", "V", "IV", "I"], 3, ["extended"], "A dominant detour returns through IV.", "plagal"),
  p("maj-021", "iii to vi cadence", ["I", "iii", "vi", "ii", "V", "I"], 3, ["circle"], "Circle-like motion from iii to vi to ii-V-I.", "authentic"),
  p("maj-022", "Plagal cadence", ["I", "V", "IV", "I"], 1, ["cadence"], "Ends with IV-I plagal motion.", "plagal"),
  p("maj-023", "Predominant loop", ["I", "IV", "ii", "V"], 2, ["loop"], "Alternates two predominant colors before V.", "half"),
  p("maj-024", "Tonic neighbors", ["I", "vi", "iii", "vi", "IV", "V"], 4, ["extended"], "A longer tonic-family expansion.", "half"),
  p("maj-025", "Complete cadence study", ["I", "iii", "vi", "IV", "ii", "V", "I"], 4, ["extended", "cadence"], "Combines tonic substitutes and a full predominant-dominant cadence.", "authentic"),
];
