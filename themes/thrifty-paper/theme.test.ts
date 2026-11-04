import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  composite,
  contrastRatio,
  luminance,
  parseColour,
  type Rgb,
} from "../../packages/themes-shared/src/colour.js";
import { contrastFailures } from "../../packages/themes-shared/src/contrast.js";
import { utilitiesOf } from "../../packages/themes-shared/src/utilities.js";

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
  expect(rules).not.toContain("@");
  const selectors = [...rules.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((rule) =>
    (rule[1] ?? "").split(/,(?![^(]*\))/).map((selector) => selector.trim()),
  );
  expect(selectors.length).toBeGreaterThan(1);
  expect(selectors.filter((selector) => !/^\.thrifty-paper(\s|$)/.test(selector))).toEqual([]);
});

it("leaves the Tailwind import to the consumer", () => {
  expect(rules).not.toMatch(/@import\s+["']tailwindcss/);
  expect(pkg.peerDependencies.tailwindcss).toBeDefined();
});

it("remaps every utility in @hackcove/ui-react's palette", () => {
  const palette: Record<string, string[]> = JSON.parse(
    read("../../packages/ui-react/palette.json"),
  );
  const missing = Object.values(palette)
    .flat()
    .filter((utility) => {
      const selector = "." + utility.replace(/[:/]/g, "\\$&");
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return !new RegExp(`${escaped}(?=[\\s,:{])`).test(css);
    });
  expect(missing).toEqual([]);
});

it("meets the contrast contract: every pair measured on every surface at WCAG AA", () => {
  // packages/themes-shared/src/contrastRules.ts says which pairs and which bar; a failure names the
  // pair, both colours, the ratio and the bar.
  const palette: Record<string, string[]> = JSON.parse(
    read("../../packages/ui-react/palette.json"),
  );
  expect(contrastFailures(css, palette)).toEqual([]);
});

// What the theme paints a utility, composited over `over` (an opaque colour).
const utilities = utilitiesOf(css);
const painted = (utility: string, property: string, over: Rgb): Rgb => {
  const colour = parseColour(utilities.get(utility)?.[property] ?? "");
  if (!colour) throw new Error(`${utility} sets no ${property}`);
  return composite(colour, over);
};
const SURFACES = [
  ["white", "#ffffff"],
  ["canvas", "#fdfbf7"],
  ["subtle", "#f7f2e9"],
] as const;

it("never lightens a control edge on hover", () => {
  for (const [name, surface] of SURFACES) {
    const under = parseColour(surface)?.rgb ?? [0, 0, 0];
    const rest = contrastRatio(painted("border-slate-300", "border-color", under), under);
    const hover = contrastRatio(painted("hover:border-violet-400", "border-color", under), under);
    expect(hover, `hover edge on ${name}`).toBeGreaterThanOrEqual(rest);
  }
});

it("keeps the media scrim dark in this light theme", () => {
  // Lightbox paints `bg-black/90` over the cream page; it must stay near-black, not turn light.
  // Its text and focus ring are measured on it by the contrast contract.
  const canvas = parseColour("#fdfbf7")?.rgb ?? [0, 0, 0];
  expect(luminance(painted("bg-black/90", "background-color", canvas))).toBeLessThan(0.05);
});

it("owns the page canvas and the type faces", () => {
  // AppShell paints `bg-gray-50` (the palette's canvas role) and sets `font-sans`.
  expect(rules).toMatch(/\.thrifty-paper \.bg-gray-50\s*\{\s*background-color:\s*#fdfbf7;/);
  const scope = /^\.thrifty-paper\s*\{([^{}]*)\}/m.exec(rules)?.[1] ?? "";
  expect(scope).toMatch(/--font-sans:\s*Inter,/);
  expect(scope).toMatch(/--font-mono:\s*ui-monospace,/);
  expect(scope).toMatch(/font-family:\s*var\(--font-sans\)/);
});
