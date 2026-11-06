import { describe, expect, it } from "vitest";
import { stepFailure } from "./visual-tools.js";

describe("stepFailure", () => {
  it("names the signal when the step was killed by one", () => {
    expect(stepFailure("bun run pixelslash", "/work/app", "SIGTERM")).toBe(
      "`bun run pixelslash` killed by SIGTERM in /work/app",
    );
    expect(stepFailure("bun run pixelslash", "/work/app", "SIGTERM")).toContain("SIGTERM");
  });

  it("keeps the plain message for an ordinary non-zero exit", () => {
    expect(stepFailure("bunx nx build storybook", "/work/base", null)).toBe(
      "`bunx nx build storybook` failed in /work/base",
    );
    expect(stepFailure("bunx nx build storybook", "/work/base", undefined)).toBe(
      "`bunx nx build storybook` failed in /work/base",
    );
  });
});
