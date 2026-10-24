import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

const dir = import.meta.dirname;
const read = (file: string): string => readFileSync(`${dir}/${file}`, "utf8");
const pkg = JSON.parse(read("package.json"));
const css = read("theme.css");
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

it("exports theme.css and ships only theme.css", () => {
  expect(pkg.name).toBe("@hackcove/theme-thrifty-paper");
  expect(Object.keys(pkg.exports)).toEqual(["./theme.css", "./package.json"]);
  expect(pkg.files).toEqual(["theme.css"]);
  expect(pkg.files.filter((file: string) => !existsSync(`${dir}/${file}`))).toEqual([]);
});

it("is light and scopes every rule under .thrifty-paper", () => {
  expect(rules).toMatch(/^\.thrifty-paper\s*\{\s*color-scheme:\s*light;/m);
  expect(rules).not.toContain("@custom-variant");
  const selectors = [...rules.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((rule) =>
    (rule[1] ?? "").split(",").map((selector) => selector.trim()),
  );
  expect(selectors.length).toBeGreaterThan(1);
  expect(selectors.filter((selector) => !/^\.thrifty-paper(\s|$)/.test(selector))).toEqual([]);
});

it("leaves the Tailwind import to the consumer", () => {
  expect(rules).not.toMatch(/@import\s+["']tailwindcss/);
  expect(pkg.peerDependencies.tailwindcss).toBeDefined();
});

it("remaps every utility in @hackcove/ui's palette", () => {
  const palette: Record<string, string[]> = JSON.parse(read("../../packages/ui/palette.json"));
  const missing = Object.values(palette)
    .flat()
    .filter((utility) => {
      const selector = "." + utility.replace(/[:/]/g, "\\$&");
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return !new RegExp(`${escaped}(?=[\\s,:{])`).test(css);
    });
  expect(missing).toEqual([]);
});

// The colour a utility resolves to under `.thrifty-paper`, composited over `over`.
const hex = (value: string) => [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16));
const channels = (colour: string, over: string): number[] => {
  const rgba = colour.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/);
  if (!rgba) return hex(colour);
  const alpha = Number(rgba[4]);
  return hex(over).map((back, i) => Number(rgba[i + 1]) * alpha + back * (1 - alpha));
};
const colourOf = (utility: string, property: string): string => {
  const selector = ".thrifty-paper ." + utility.replace(/[:/]/g, "\\$&");
  const rule = [...rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((match) =>
    (match[1] ?? "")
      .split(",")
      .some((part) => part.trim().replace(/:(hover|focus-visible)$/, "") === selector),
  );
  return rule?.[2]?.match(new RegExp(`${property}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
};
const luminance = (rgb: number[]): number => {
  const [r = 0, g = 0, b = 0] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (utility: string, property: string, against: string): number => {
  const colour = colourOf(utility, property);
  const [hi = 0, lo = 0] = [
    luminance(channels(colour, against)),
    luminance(channels(against, against)),
  ].toSorted((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};
const WHITE = "#ffffff";
const CANVAS = "#fdfbf7";
const SUBTLE = "#f7f2e9";
const DANGER_SOFT = "#fef2f2";

it("keeps the date components' text at WCAG AA (4.5:1)", () => {
  // Days outside the month and the Clear/segment accent on its soft hover fill.
  expect(contrast("text-slate-300", "color", WHITE)).toBeGreaterThanOrEqual(4.5);
  expect(contrast("text-violet-600", "color", "#fdf5f0")).toBeGreaterThanOrEqual(4.5);
  expect(contrast("text-red-700", "color", DANGER_SOFT)).toBeGreaterThanOrEqual(4.5);
});

it("draws control edges at 3:1 on white, canvas and subtle", () => {
  for (const against of [WHITE, CANVAS, SUBTLE]) {
    expect(contrast("border-slate-300", "border-color", against)).toBeGreaterThanOrEqual(3);
  }
});

it("never lightens a control edge on hover, and draws an invalid edge at 3:1", () => {
  for (const against of [WHITE, CANVAS, SUBTLE]) {
    expect(contrast("hover:border-violet-400", "border-color", against)).toBeGreaterThanOrEqual(
      contrast("border-slate-300", "border-color", against),
    );
  }
  expect(contrast("border-red-200", "border-color", DANGER_SOFT)).toBeGreaterThanOrEqual(3);
  expect(contrast("border-red-200", "border-color", CANVAS)).toBeGreaterThanOrEqual(3);
});

it("keeps the focus ring at 3:1 on every surface", () => {
  for (const against of [WHITE, CANVAS, SUBTLE]) {
    expect(
      contrast("focus-visible:outline-violet-600", "outline-color", against),
    ).toBeGreaterThanOrEqual(3);
  }
});

it("keeps the danger button's text at WCAG AA (4.5:1) on its fill, resting and hovered", () => {
  for (const fill of ["bg-red-600", "hover:bg-red-700"]) {
    const bg = colourOf(fill, "background-color");
    expect(contrast("text-red-50", "color", bg)).toBeGreaterThanOrEqual(4.5);
  }
});

it("keeps the violet and sky Pill text at WCAG AA (4.5:1) on its soft fill", () => {
  for (const [text, fill] of [
    ["text-violet-700", "bg-violet-50"],
    ["text-sky-700", "bg-sky-50"],
  ] as const) {
    expect(contrast(text, "color", colourOf(fill, "background-color"))).toBeGreaterThanOrEqual(4.5);
  }
});
