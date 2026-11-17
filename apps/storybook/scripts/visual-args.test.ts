import { describe, expect, it } from "vitest";
import { pickGroups, savedPlanFrom, stepFrom, type SavedPlan } from "./visual-args.js";

const plan: SavedPlan = {
  id: "plan-1",
  upload: false,
  all: true,
  mode: null,
  sha: "b".repeat(40),
  head: "a".repeat(40),
  groups: ["overview", "actions", "forms"].map((slug) => ({
    slug,
    project: `hackcove-ui-${slug}`,
    skipped: slug === "actions",
    captures: [],
  })),
};
const run = { upload: false, all: true, head: "a".repeat(40) };

describe("stepFrom", () => {
  it("runs everything when no step is named", () => {
    expect(stepFrom(["--run"])).toEqual({ kind: "whole" });
    expect(stepFrom(["--run", "--all", "--upload"])).toEqual({ kind: "whole" });
  });

  it("reads each step", () => {
    expect(stepFrom(["--run", "--all", "--plan-only"])).toEqual({ kind: "plan" });
    expect(stepFrom(["--run", "--summary-only"])).toEqual({ kind: "summary" });
    expect(stepFrom(["--run", "--group", "forms", "--all", "--group", "pages"])).toEqual({
      kind: "groups",
      slugs: ["forms", "pages"],
    });
  });

  it("refuses a --group with no slug", () => {
    expect(() => stepFrom(["--run", "--group"])).toThrow("--group needs");
    expect(() => stepFrom(["--run", "--group", "--all"])).toThrow("--group needs");
  });

  it("refuses an argument it does not know, so a typo never runs everything", () => {
    expect(() => stepFrom(["--run", "--group=forms"])).toThrow("unknown argument --group=forms");
    expect(() => stepFrom(["--run", "--plan-ony"])).toThrow("unknown argument --plan-ony");
  });

  it("refuses two steps at once", () => {
    expect(() => stepFrom(["--run", "--plan-only", "--summary-only"])).toThrow("not several");
    expect(() => stepFrom(["--run", "--plan-only", "--group", "forms"])).toThrow("not several");
  });
});

describe("savedPlanFrom", () => {
  it("refuses when there is no plan", () => {
    expect(() => savedPlanFrom(null)).toThrow("no saved plan");
    expect(() => savedPlanFrom({ id: "x" })).toThrow("no saved plan");
  });

  it("reads a plan, and refuses one with no `head`", () => {
    expect(savedPlanFrom(plan)).toEqual(plan);
    const { head: _, ...old } = plan;
    expect(() => savedPlanFrom(old)).toThrow("no saved plan");
  });
});

describe("pickGroups", () => {
  it("takes the named groups in the plan's order, skipped ones included", () => {
    const picked = pickGroups(plan, { ...run, slugs: ["forms", "actions"] });
    expect(picked.map((g) => g.slug)).toEqual(["actions", "forms"]);
  });

  it("refuses a plan for the other kind of run", () => {
    expect(() => pickGroups(plan, { ...run, upload: true, slugs: ["forms"] })).toThrow(
      "the saved plan is for a local compare, and this run is an upload",
    );
    expect(() =>
      pickGroups({ ...plan, upload: true, mode: "branch" }, { ...run, slugs: ["forms"] }),
    ).toThrow("the saved plan is for an upload, and this run is a local compare");
  });

  it("refuses a plan of everything for a run of what the change reaches, and the other way", () => {
    expect(() => pickGroups(plan, { ...run, all: false, slugs: ["forms"] })).toThrow(
      "the saved plan takes every group whole, and this run asks for only what the change reaches",
    );
    expect(() => pickGroups({ ...plan, all: false }, { ...run, slugs: ["forms"] })).toThrow(
      "the saved plan takes only what the change reaches, and this run asks for every group whole (--all)",
    );
  });

  it("refuses when HEAD moved since the plan, naming both commits", () => {
    expect(() => pickGroups(plan, { ...run, head: "c".repeat(40), slugs: ["forms"] })).toThrow(
      "the saved plan was made on aaaaaaa, and HEAD is now ccccccc; plan again with --plan-only",
    );
  });

  it("refuses an unknown slug, naming the plan's", () => {
    expect(() => pickGroups(plan, { ...run, slugs: ["forms", "nope"] })).toThrow(
      "the saved plan has no group nope; its groups are overview, actions, forms",
    );
  });
});
