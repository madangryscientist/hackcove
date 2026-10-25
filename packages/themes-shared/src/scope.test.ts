import { describe, expect, it } from "vitest";
import { themeScope } from "./scope.js";

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
