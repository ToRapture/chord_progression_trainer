import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../app/styles.css", import.meta.url), "utf8");

function ruleFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? "";
}

describe("Common chords styles", () => {
  it("keeps common chord chips readable in a horizontal scroller", () => {
    expect(ruleFor(".common-chords-container")).toContain("overflow-x: auto");
    expect(ruleFor(".common-chords-row")).toContain("flex-wrap: nowrap");
    expect(ruleFor(".common-chord-col")).toContain("flex: 0 0 auto");
    expect(ruleFor(".common-chord-col .progression-chord")).toContain("font-size: 1rem");
    expect(ruleFor(".common-chord-col .progression-chord")).toContain("min-width:");
  });
});
