import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { unknownNames, workspaceNames } from "./contract.ts";

const root = join(import.meta.dirname, "..", "..");

describe("workspace", () => {
  it("finds every package and theme by folder", () => {
    expect(workspaceNames(root)).toEqual(
      expect.arrayContaining(["@hackcove/ui", "@hackcove/theme-catppuccin-mocha"]),
    );
  });

  it("keeps the root README to package names that exist", () => {
    expect(unknownNames(join(root, "README.md"), root)).toEqual([]);
  });
});
