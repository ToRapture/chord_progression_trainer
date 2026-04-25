import {
  ProgressionGenerationRequest,
  ProgressionProvider,
} from "./types";
import { ProgressionTemplate } from "../progressions/types";
import {
  getProgressionsByMode,
  getProgressionsByDifficulty,
} from "../progressions/index";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const localProvider: ProgressionProvider = {
  async generateProgressions(
    request: ProgressionGenerationRequest
  ): Promise<ProgressionTemplate[]> {
    let pool = getProgressionsByMode(request.mode);

    pool = pool.filter(
      (p) =>
        p.difficulty <= request.difficulty &&
        p.roman.length >= request.lengthRange[0] &&
        p.roman.length <= request.lengthRange[1]
    );

    if (request.allowedChords.length > 0) {
      pool = pool.filter((p) =>
        p.roman.every((r) => {
          const base = r.replace(/7|maj7|m7|°|ø|m/g, "");
          return request.allowedChords.some(
            (a) => a.replace(/7|maj7|m7|°|ø|m/g, "") === base
          );
        })
      );
    }

    if (request.tags && request.tags.length > 0) {
      pool = pool.filter((p) =>
        request.tags!.some((t) => p.tags.includes(t))
      );
    }

    return shuffleArray(pool).slice(0, request.count);
  },
};
