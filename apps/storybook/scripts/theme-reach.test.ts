import { describe, expect, it } from "vitest";
import { capturesOnBase } from "./theme-reach.js";

// `themesOf` is driven through `planCapture` in visual-plan.test.ts; only the base selection, which
// has no other caller, gets its own cases here.
const ref = { titles: ["Stack"], themes: ["a"] };
const gallery = { titles: ["Gallery"], themes: ["b", "c"] };
const themesOf = (base: string[], branch: string[], captures = [ref, gallery]) =>
  capturesOnBase(captures, base, branch).map((c) => c.themes);

describe("capturesOnBase", () => {
  it("is the branch's captures when the themes are the same", () => {
    expect(themesOf(["a", "b", "c"], ["a", "b", "c"])).toEqual([["a"], ["b", "c"]]);
  });

  it("leaves out a theme new on the branch, so it shows as new", () => {
    expect(themesOf(["a", "b"], ["a", "b", "c"])).toEqual([["a"], ["b"]]);
  });

  it("shoots a removed theme in the Gallery sections only, so they show as removed", () => {
    expect(themesOf(["a", "b", "c", "old"], ["a", "b", "c"])).toEqual([["a"], ["b", "c", "old"]]);
    expect(themesOf(["a", "old"], ["a"], [ref])).toEqual([["a"]]);
    // A branch left with one theme keeps the Gallery sections' capture in no theme (`--all`).
    expect(themesOf(["a", "old"], ["a"], [ref, { ...gallery, themes: [] }])).toEqual([
      ["a"],
      ["old"],
    ]);
  });

  it("shoots every story in the base's reference when a new theme sorts first", () => {
    const branch = ["0new", "a", "b", "c"];
    const captures = [
      { titles: ["Stack"], themes: ["0new"] },
      { titles: ["Gallery"], themes: ["a", "b", "c"] },
    ];
    expect(themesOf(["a", "b", "c"], branch, captures)).toEqual([["a"], ["b", "c"]]);
  });

  it("shoots every story in a removed reference", () => {
    const captures = [
      { titles: ["Stack"], themes: ["b"] },
      { titles: ["Gallery"], themes: ["c"] },
    ];
    expect(themesOf(["a", "b", "c"], ["b", "c"], captures)).toEqual([["b", "a"], ["c"]]);
  });
});
