import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../app/App.tsx", import.meta.url), "utf8");

describe("trainer control markup", () => {
  it("renders difficulty, tempo, and choices controls as selects", () => {
    const controlBlock = appSource.slice(
      appSource.indexOf("<label>Difficulty Min</label>"),
      appSource.indexOf("<button className=\"btn btn-primary\" onClick={props.onGenerateExercise}")
    );

    expect(controlBlock.match(/<select/g)?.length).toBe(4);
    expect(controlBlock).not.toContain('type="number"');
  });
});
