import { describe, expect, it } from "vitest";
import { parseThemePath, themeId } from "./ids.js";

describe("themeId", () => {
  it("keeps the folder's name for a package's main theme.css, so existing ids do not change", () => {
    expect(themeId("thrifty-paper", "theme.css")).toBe("thrifty-paper");
  });

  it("joins the folder and the file name for any other file", () => {
    expect(themeId("catppuccin-mocha", "latte.css")).toBe("catppuccin-mocha-latte");
  });
});

describe("parseThemePath", () => {
  it("reads the folder and file off the end of a glob path", () => {
    expect(parseThemePath("../../../themes/a/theme.css")).toEqual({
      folder: "a",
      file: "theme.css",
      id: "a",
    });
    expect(parseThemePath("../../../themes/a/b.css").id).toBe("a-b");
  });
});
