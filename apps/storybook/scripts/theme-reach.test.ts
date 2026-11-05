import { describe, expect, it } from "vitest";
import { themesOnBase } from "./theme-reach.js";

// `themesOf` is driven through `planCapture` in visual-plan.test.ts; only the base selection, which
// has no other caller, gets its own cases here.
describe("themesOnBase", () => {
  it("leaves out a theme new on the branch, so it shows as new", () => {
    expect(themesOnBase(["a"], ["a", "new"], ["a", "new"])).toEqual(["a"]);
  });

  it("takes a theme the branch no longer has, so it shows as removed", () => {
    expect(themesOnBase(["a", "old"], ["a"], ["a"])).toEqual(["a", "old"]);
  });

  it("is empty when the base has none of the picked themes", () => {
    expect(themesOnBase(["a"], ["new"], ["a", "new"])).toEqual([]);
  });
});
