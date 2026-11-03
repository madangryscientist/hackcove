import { describe, expect, it } from "vitest";
import { declaresDark, themeScope } from "./scope.js";

describe("themeScope", () => {
  it("reads the first top-level class rule, past an at-rule and comments", () => {
    expect(themeScope("@custom-variant dark (&:is(.dark *));\n.dark {\n  --x: 1;\n}")).toBe("dark");
    expect(themeScope("/* .nope { } */\n.a-b {\n}\n.c {\n}")).toBe("a-b");
  });

  it("reads a minified rule that follows a semicolon or a brace", () => {
    expect(themeScope("@custom-variant dark (&:is(.dark *));.dark{--x:1}")).toBe("dark");
    expect(themeScope(".a{--x:1}.b{--y:2}")).toBe("a");
  });

  it("returns undefined when there is no class rule", () => {
    expect(themeScope("body {}")).toBeUndefined();
  });
});

describe("declaresDark", () => {
  it("is true for a theme that declares the dark variant, minified or not", () => {
    expect(declaresDark("@custom-variant dark (&:where(.dark, .dark *));\n.dark{}")).toBe(true);
    expect(declaresDark(".x{}@custom-variant dark (&:where(.dark,.dark *));.dark{}")).toBe(true);
  });

  it("is false for a light theme, even one whose comment mentions the dark variant", () => {
    expect(declaresDark("/* declares no @custom-variant dark */\n.paper {\n}")).toBe(false);
    expect(declaresDark(".paper{}")).toBe(false);
  });
});
