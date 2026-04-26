import { functionSequence } from "../harmony/functionGroups";
import type { ProgressionTemplate } from "./types";

function p(id: string, name: string, roman: string[], difficulty: 1 | 2 | 3 | 4 | 5, tags: string[], description: string, cadence: ProgressionTemplate["cadence"]): ProgressionTemplate {
  return { id, name, mode: "minor", roman, functions: functionSequence(roman, "minor"), difficulty, tags: ["minor", "basic", ...tags], description, cadence };
}

export const minorBasicProgressions: ProgressionTemplate[] = [
  p("min-001", "Minor authentic cadence", ["i", "V", "i"], 1, ["cadence"], "Minor tonic with harmonic-minor dominant.", "authentic"),
  p("min-002", "Minor primary cadence", ["i", "iv", "V", "i"], 1, ["cadence"], "Minor tonic, subdominant, dominant and return.", "authentic"),
  p("min-003", "Diminished pre-dominant", ["i", "ii°", "V", "i"], 2, ["cadence"], "Uses ii diminished before V.", "authentic"),
  p("min-004", "Natural minor loop", ["i", "VI", "VII", "i"], 1, ["loop"], "Aeolian color with VI and VII.", "loop"),
  p("min-005", "Descending minor", ["i", "VII", "VI", "V"], 2, ["basic"], "Descending bass shape into harmonic-minor V.", "half"),
  p("min-006", "Andalusian branch", ["i", "iv", "VII", "III"], 2, ["loop"], "Common minor progression through iv-VII-III.", "loop"),
  p("min-007", "Minor pop loop", ["i", "VI", "III", "VII"], 1, ["pop", "loop"], "Relative-major flavored minor loop.", "loop"),
  p("min-008", "iv neighbor", ["i", "iv", "i", "V"], 1, ["basic"], "Moves between tonic and iv before V.", "half"),
  p("min-009", "VII III VI", ["i", "VII", "III", "VI"], 2, ["basic"], "Natural-minor functional color.", "none"),
  p("min-010", "Minor V7 cadence", ["i", "iv", "V7", "i"], 2, ["cadence"], "Harmonic-minor V7 resolves to i.", "authentic"),
  p("min-011", "Full minor cadence", ["i", "iv", "ii°", "V7", "i"], 3, ["cadence"], "Pre-dominant iv and ii diminished before V7.", "authentic"),
  p("min-012", "VI iv V7", ["i", "VI", "iv", "V7"], 2, ["basic"], "VI and iv prepare the dominant seventh.", "half"),
  p("min-013", "Chromatic descent", ["i", "bVII", "bVI", "V7"], 3, ["borrowed"], "Descending roots into harmonic-minor V7.", "half"),
  p("min-014", "Long minor cadence", ["i", "VII", "III", "VI", "ii°", "V", "i"], 4, ["extended"], "Longer natural-minor path into authentic cadence.", "authentic"),
  p("min-015", "i VI iv V", ["i", "VI", "iv", "V"], 2, ["cadence"], "Clear tonic-predominant-dominant motion.", "half"),
  p("min-016", "i bVI bVII i", ["i", "bVI", "bVII", "i"], 2, ["loop", "borrowed"], "Modal minor colors with bVI and bVII.", "loop"),
  p("min-017", "i v VI iv", ["i", "v", "VI", "iv"], 3, ["basic"], "Natural dominant minor v contrasted with VI and iv.", "none"),
  p("min-018", "Complete minor study", ["i", "VI", "iv", "ii°", "V7", "i"], 4, ["extended", "cadence"], "Minor tonic, predominant colors, and a V7 resolution.", "authentic"),
];
