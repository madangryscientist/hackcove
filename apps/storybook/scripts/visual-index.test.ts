import { describe, expect, it } from "vitest";
import { shotsByTheme, shotsOf, type StoryIndex } from "./visual-index.js";

// Two titles: Button has 3 stories, one of them shot once; Card has 2, none shot once.
const index: StoryIndex = new Map([
  ["Actions/Button", { stories: 3, once: 1 }],
  ["Layout/Card", { stories: 2, once: 0 }],
]);
const titles = ["Actions/Button", "Layout/Card"];

describe("shot counts", () => {
  it("counts every story once per theme, a once story once, at one variant", () => {
    expect(shotsOf(index, titles, 4, 1)).toBe(4 * 4 + 1);
  });

  it("doubles every count at two variants", () => {
    expect(shotsOf(index, titles, 4, 2)).toBe(2 * shotsOf(index, titles, 4, 1));
    const captures = [{ titles, themes: ["a", "b"] }];
    const one = shotsByTheme(index, captures, 1);
    const two = shotsByTheme(index, captures, 2);
    expect(two.once).toBe(2 * one.once);
    expect([...two.themes]).toEqual([...one.themes].map(([id, n]) => [id, 2 * n]));
  });
});
