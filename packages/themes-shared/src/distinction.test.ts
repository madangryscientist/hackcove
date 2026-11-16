import { describe, expect, it } from "vitest";
import { propertyOf } from "./contrast.js";
import type { Palette } from "./contrastRules.js";
import { distinctionFailures } from "./distinction.js";

const palette: Palette = { categorical: ["text-indigo-600", "text-orange-600", "text-teal-600"] };

const theme = (overrides: Record<string, string> = {}): string => {
  const colours: Record<string, string> = {
    "bg-violet-600": "#c2410c",
    "bg-red-600": "#7a1220",
    "text-violet-600": "#9a3412",
    "text-red-700": "#7a1220",
    "bg-gray-50": "#f5f5f4",
    "bg-white": "#ffffff",
    "bg-slate-50": "#f4efe6",
    "bg-slate-200": "#d6cbb8",
    "text-indigo-600": "#1b6096",
    "text-orange-600": "#d2391a",
    "text-teal-600": "#1b8177",
    ...overrides,
  };
  return [
    ".demo { color-scheme: light; }",
    ...Object.entries(colours).map(
      ([utility, value]) => `.demo .${utility} { ${propertyOf(utility)}: ${value}; }`,
    ),
  ].join("\n");
};

describe("distinctionFailures", () => {
  it("is empty for a theme that tells its tones apart", () => {
    expect(distinctionFailures(theme(), palette)).toEqual([]);
  });

  it("names the pair, both colours, the distance and the bar", () => {
    const [failure = ""] = distinctionFailures(theme({ "bg-red-600": "#c2410c" }), palette);
    expect(failure).toMatch(
      /^primary and danger fills: bg-violet-600 #c2410c and bg-red-600 #c2410c are 0\.000 apart in OKLab, needs 0\.12 \(.+\)$/,
    );
  });

  it("holds a loading bone apart from the canvas, the surface and the subtle strip", () => {
    const failures = distinctionFailures(theme({ "bg-slate-200": "#f4efe6" }), palette);
    expect(failures).toHaveLength(3);
    expect(failures[2]).toMatch(
      /^loading bone on the subtle strip: bg-slate-200 #f4efe6 and bg-slate-50 #f4efe6 are 0\.000 apart in OKLab, needs 0\.05 \(.+\)$/,
    );
  });

  it("holds every two categorical colours 0.12 apart, naming both", () => {
    const failures = distinctionFailures(theme({ "text-teal-600": "#1b6096" }), palette);
    expect(failures).toEqual([
      expect.stringMatching(
        /^categories cat1 and cat3: text-indigo-600 #1b6096 and text-teal-600 #1b6096 are 0\.000 apart in OKLab, needs 0\.12 \(.+\)$/,
      ),
    ]);
  });
});
