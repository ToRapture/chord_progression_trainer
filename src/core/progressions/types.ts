import type { FunctionGroup, RomanNumeral } from "../harmony/types";

export type ProgressionTemplate = {
  id: string;
  name: string;
  mode: "major" | "minor" | "both";
  roman: RomanNumeral[];
  functions: FunctionGroup[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  description: string;
  cadence?: "authentic" | "plagal" | "half" | "deceptive" | "loop" | "none";
};
