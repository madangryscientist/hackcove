import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  composite,
  luminance,
  oklabDistance,
  parseColour,
  type Rgb,
} from "../packages/themes-shared/src/colour.js";
import { contrastFailures } from "../packages/themes-shared/src/contrast.js";
import { declaresDark, themeScope } from "../packages/themes-shared/src/scope.js";
import { utilitiesOf } from "../packages/themes-shared/src/utilities.js";

const dir = import.meta.dirname;
const read = (file: string): string => readFileSync(`${dir}/${file}`, "utf8");
const strip = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");
const pkg = JSON.parse(read("package.json"));
const palette: Record<string, string[]> = JSON.parse(read("../packages/ui-react/palette.json"));
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The plain-disabled marker of a solid Button, which a theme that restyles one flattens (HC-148). */
const DISABLED = /\.disabled\\:opacity-50:disabled:is\(/;

// Every CSS file here is its own theme with its own scope class, and each meets the same contract.
// The scope and the dark flag are read from the file, so this names no theme.
const files = readdirSync(dir)
  .filter((file) => file.endsWith(".css"))
  .toSorted();

it("is one package, and lists no theme", () => {
  expect(pkg.name).toBe("@hackcove/themes");
  expect(pkg.license).toBe("MIT");
  expect(Object.keys(pkg.exports)).toEqual(["./*.css", "./package.json"]);
  expect(pkg.exports["./*.css"]).toBe("./*.css");
  expect(pkg.files).toEqual(["*.css", "NOTICE", "LICENSE"]);
  expect(Object.keys(pkg.peerDependencies)).toEqual(["tailwindcss"]);
  expect(pkg.dependencies).toBeUndefined();
});

it("carries a licence and the upstream notice", () => {
  expect(existsSync(`${dir}/LICENSE`)).toBe(true);
  expect(read("NOTICE")).toContain("Copyright (c)");
  expect(read("NOTICE")).toContain("Permission is hereby granted");
});

it("packs every theme, and nothing else but the manifest, the README and the licences", () => {
  // npm's JSON is an array, or from npm 12 an object keyed by package; `Object.values` reads both.
  const packed = Object.values<{ files: { path: string }[] }>(
    JSON.parse(
      execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
        cwd: dir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    ),
  );
  expect((packed[0]?.files ?? []).map((file) => file.path).toSorted()).toEqual(
    [...files, "LICENSE", "NOTICE", "README.md", "package.json"].toSorted(),
  );
});

it("gives every theme its own scope class", () => {
  const scopes = files.map((file) => themeScope(read(file)));
  expect(scopes.every((scope) => scope !== undefined)).toBe(true);
  expect(new Set(scopes).size).toBe(files.length);
});

it("keeps the plain-disabled Button flattened in at least one theme", () => {
  // A theme that restyles a plain-disabled solid Button must flatten it (HC-148), which the per-file
  // contract checks. If no theme keeps the rule at all, the behaviour has silently gone.
  expect(files.filter((file) => DISABLED.test(read(file))).length).toBeGreaterThan(0);
});

describe.each(files)("%s", (file) => {
  const css = read(file);
  const rules = strip(css);
  const scope = themeScope(css) ?? "";
  const scoped = new RegExp(`^\\.${escapeRe(scope)}(\\s|$)`);

  // What the theme paints a utility, composited over `over` (an opaque colour).
  const utilities = utilitiesOf(css);
  const painted = (utility: string, property: string, over: Rgb): Rgb => {
    const colour = parseColour(utilities.get(utility)?.[property] ?? "");
    if (!colour) throw new Error(`${utility} sets no ${property}`);
    return composite(colour, over);
  };
  const canvas = painted("bg-gray-50", "background-color", [0, 0, 0]);

  it("names a scope class and declares the dark variant only if it is dark", () => {
    expect(scope).not.toBe("");
    expect(css.includes("@custom-variant dark")).toBe(declaresDark(css));
    // A dark theme's variant targets its own scope; a light one has no variant to check.
    const variant = new RegExp(`@custom-variant dark[^;]*\\.${escapeRe(scope)}`);
    expect(!declaresDark(css) || variant.test(css)).toBe(true);
  });

  it("scopes every rule under its own class, apart from the @custom-variant at-rule", () => {
    // An unscoped rule (a bare `.link`) would restyle a consumer's page whatever theme it picked.
    const flat = rules.replace(/@custom-variant[^;]*;/g, "");
    expect(flat).not.toMatch(/@/);
    const selectors = [...flat.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((rule) =>
      (rule[1] ?? "").split(/,(?![^(]*\))/).map((selector) => selector.trim()),
    );
    expect(selectors.length).toBeGreaterThan(1);
    expect(selectors.filter((selector) => !scoped.test(selector))).toEqual([]);
  });

  it("leaves the Tailwind import to the consumer", () => {
    expect(rules).not.toMatch(/@import\s+["']tailwindcss/);
  });

  it("opens with a banner a minifier keeps", () => {
    expect(css).toMatch(/^\/\*! /);
  });

  it("remaps every utility in @hackcove/ui-react's palette", () => {
    const missing = Object.values(palette)
      .flat()
      .filter((utility) => {
        const escaped = escapeRe("." + utility.replace(/[:/]/g, "\\$&"));
        return !new RegExp(`${escaped}(?=[\\s,:{])`).test(css);
      });
    expect(missing).toEqual([]);
  });

  it("meets the contrast contract: every pair measured on every surface at WCAG AA", () => {
    // packages/themes-shared/src/contrastRules.ts says which pairs and which bar; a failure names
    // the pair, both colours, the ratio and the bar.
    expect(contrastFailures(css, palette)).toEqual([]);
  });

  it("owns the page canvas and the type faces", () => {
    // AppShell paints `bg-gray-50` (the palette's canvas role) and sets `font-sans`.
    expect(rules).toMatch(
      new RegExp(
        `\\.${escapeRe(scope)} \\.bg-gray-50\\s*\\{\\s*background-color:\\s*#[0-9a-f]{6};`,
      ),
    );
    const block =
      new RegExp(`^\\.${escapeRe(scope)}\\s*\\{([^{}]*)\\}`, "m").exec(rules)?.[1] ?? "";
    expect(block).toMatch(/--font-sans:\s*Inter,/);
    expect(block).toMatch(/--font-mono:\s*ui-monospace,/);
    expect(block).toMatch(/font-family:\s*var\(--font-sans\)/);
  });

  it("keeps the media scrim dark", () => {
    // Lightbox paints `bg-black/90` over the page; it must stay near-black on a light theme too.
    // Its text and focus ring are measured on it by the contrast contract.
    expect(luminance(painted("bg-black/90", "background-color", canvas))).toBeLessThan(0.05);
  });

  it("exposes the six colours of chrome the kit cannot draw, each the value its utility paints", () => {
    // A map popup or marker reads these with var(--hc-…) (README, "Colours for chrome the kit cannot
    // draw"). Each must equal the hex its utility's rule sets under this scope, so a palette edit
    // that forgets one fails here. The utilities are read by selector; no value or theme is listed.
    const block =
      new RegExp(`^\\.${escapeRe(scope)}\\s*\\{([^{}]*)\\}`, "m").exec(rules)?.[1] ?? "";
    const exposed = new Map(
      [...block.matchAll(/--hc-([\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
        match[1] ?? "",
        (match[2] ?? "").trim().toLowerCase(),
      ]),
    );
    const chrome: Record<string, [utility: string, property: string]> = {
      surface: ["bg-white", "background-color"],
      subtle: ["bg-slate-50", "background-color"],
      line: ["border-slate-200", "border-color"],
      ink: ["text-slate-900", "color"],
      mute: ["text-slate-500", "color"],
      accent: ["text-violet-600", "color"],
    };
    expect([...exposed.keys()].toSorted()).toEqual(Object.keys(chrome).toSorted());
    for (const [name, [utility, property]] of Object.entries(chrome)) {
      const value = utilities.get(utility)?.[property] ?? "";
      expect(value, `${utility} sets a hex ${property}`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(exposed.get(name), `--hc-${name} equals ${utility}`).toBe(value.toLowerCase());
    }
  });

  it("tells the primary fill from the danger fill, and link text from danger text", () => {
    // One accent doing three jobs read as one colour (HC-262). The distance is OKLab, so it is how
    // far apart the eye sees them, on the page canvas: 0.12 for the two buttons (a glance, hue and
    // all), 0.09 for the two text colours (thinner marks need less).
    const fills = oklabDistance(
      painted("bg-violet-600", "background-color", canvas),
      painted("bg-red-600", "background-color", canvas),
    );
    const text = oklabDistance(
      painted("text-violet-600", "color", canvas),
      painted("text-red-700", "color", canvas),
    );
    expect(fills, "bg-violet-600 against bg-red-600").toBeGreaterThanOrEqual(0.12);
    expect(text, "text-violet-600 against text-red-700").toBeGreaterThanOrEqual(0.09);
  });

  it("keeps the media matte white", () => {
    // Image `framed` paints `bg-white/100` under a QR code, which is scanned off a dark page: it must
    // stay white on a dark theme too, unlike `bg-white`, the surface.
    expect(luminance(painted("bg-white/100", "background-color", canvas))).toBeGreaterThan(0.99);
  });

  it("flattens a plain-disabled solid Button instead of fading it, where it restyles one", () => {
    // Half opacity on a saturated fill is muddy under the label (HC-148). The rule is keyed on the
    // plain-disabled marker, so busy (keeps its colour) and blocked (already flat) are untouched.
    // The fill and the label are checked too: resetting the opacity alone still fades a solid fill.
    const rule = new RegExp(
      `\\.${escapeRe(scope)} \\.disabled\\\\:opacity-50:disabled:is\\(([^)]*)\\)\\s*\\{([^}]*)\\}`,
    ).exec(rules);
    if (rule === null) return;
    expect(rule[1]).toBe(".bg-violet-600, .bg-emerald-600, .bg-red-600");
    expect(rule[2]).toMatch(/opacity:\s*1;/);
    expect(rule[2]).toMatch(/background-color:\s*#[0-9a-f]{6};/);
    expect(rule[2]).toMatch(/(^|[\s;])color:\s*#[0-9a-f]{6};/);
  });
});

it("keeps a Thrifty Paper link apart from its primary button", () => {
  // The accent text (links, outline labels) is the deeper clay; the fill is the bright clay. A page
  // of links must not read as the button's colour (HC-262). Named here because Latte and Mocha
  // use one accent for both on purpose.
  const css = read("thrifty-paper.css");
  const utilities = utilitiesOf(css);
  const colour = (utility: string, property: string): Rgb => {
    const parsed = parseColour(utilities.get(utility)?.[property] ?? "");
    if (!parsed) throw new Error(`${utility} sets no ${property}`);
    return parsed.rgb;
  };
  const link = colour("text-violet-600", "color");
  const fill = colour("bg-violet-600", "background-color");
  expect(oklabDistance(link, fill)).toBeGreaterThanOrEqual(0.08);
});
