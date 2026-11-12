import { describe, expect, it } from "vitest";
import { propertyOf } from "./contrast.js";
import { distinctionFailures } from "./distinction.js";

const theme = (overrides: Record<string, string> = {}): string => {
  const colours: Record<string, string> = {
    "bg-violet-600": "#c2410c",
    "bg-red-600": "#7a1220",
    "text-violet-600": "#9a3412",
    "text-red-700": "#7a1220",
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
    expect(distinctionFailures(theme())).toEqual([]);
  });

  it("names the pair, both colours, the distance and the bar", () => {
    const [failure = ""] = distinctionFailures(theme({ "bg-red-600": "#c2410c" }));
    expect(failure).toMatch(
      /^primary and danger fills: bg-violet-600 #c2410c and bg-red-600 #c2410c are 0\.000 apart in OKLab, needs 0\.12 \(.+\)$/,
    );
  });
});
