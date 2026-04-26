import type { FunctionGroup, Mode, RomanNumeral } from "../harmony/types";

export type ProgressionMode = Mode | "both";

export type ProgressionTemplate = {
  id: string;
  name: string;
  mode: ProgressionMode;
  roman: RomanNumeral[];
  functions: FunctionGroup[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  description: string;
  cadence?: "authentic" | "plagal" | "half" | "deceptive" | "loop" | "none";
};

export type ProgressionGroupId = "all" | "majorBasic" | "minorBasic" | "pop" | "jazzBasic";
