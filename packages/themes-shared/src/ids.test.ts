import { describe, expect, it } from "vitest";
import { themeId } from "./ids.js";

describe("themeId", () => {
  it("is the file name without .css", () => {
    expect(themeId("some-theme.css")).toBe("some-theme");
  });

  it("reads the file off the end of a glob path", () => {
    expect(themeId("../../../themes/some-theme.css")).toBe("some-theme");
  });
});
