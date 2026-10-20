import { describePackage } from "@hackcove/tools/contract";
import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };

describePackage(`${import.meta.dirname}/..`);

describe("@hackcove/ui", () => {
  it("exports its entry point, and no theme CSS", () => {
    expect(Object.keys(pkg.exports)).toEqual([".", "./package.json"]);
  });
});
