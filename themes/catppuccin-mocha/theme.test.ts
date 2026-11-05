import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastFailures } from "../../packages/themes-shared/src/contrast.js";
import { declaresDark, themeScope } from "../../packages/themes-shared/src/scope.js";

const dir = import.meta.dirname;
const read = (file: string): string => readFileSync(`${dir}/${file}`, "utf8");
const strip = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");
const pkg = JSON.parse(read("package.json"));
const palette: Record<string, string[]> = JSON.parse(read("../../packages/ui-react/palette.json"));
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every CSS file in the folder is its own theme with its own scope class, and each meets the same
// contract. The scope and the dark flag are read from the file, so this names no flavour.
const files = readdirSync(dir)
  .filter((file) => file.endsWith(".css"))
  .toSorted();

it("carries more than one flavour, and theme.css is among them", () => {
  expect(files).toContain("theme.css");
  expect(files.length).toBeGreaterThan(1);
});

it("is named @hackcove/theme-catppuccin-mocha, whatever flavours it carries", () => {
  expect(pkg.name).toBe("@hackcove/theme-catppuccin-mocha");
  expect(pkg.files.filter((file: string) => !existsSync(`${dir}/${file}`))).toEqual([]);
  expect(pkg.peerDependencies.tailwindcss).toBeDefined();
});

it("credits Catppuccin: NOTICE carries its MIT notice", () => {
  expect(read("NOTICE")).toContain("Copyright (c) 2021 Catppuccin");
  expect(read("NOTICE")).toContain("Permission is hereby granted");
});

it("gives every flavour its own scope class", () => {
  const scopes = files.map((file) => themeScope(read(file)));
  expect(scopes.every((scope) => scope !== undefined)).toBe(true);
  expect(new Set(scopes).size).toBe(files.length);
});

describe.each(files)("%s", (file) => {
  const css = read(file);
  const rules = strip(css);
  const scope = themeScope(css) ?? "";
  const scoped = new RegExp(`^\\.${escapeRe(scope)}(\\s|$)`);

  it("is exported and shipped", () => {
    expect(Object.keys(pkg.exports)).toContain(`./${file}`);
    expect(pkg.files).toContain(file);
  });

  it("names a scope class and declares the dark variant only if it is dark", () => {
    expect(scope).not.toBe("");
    expect(css.includes("@custom-variant dark")).toBe(declaresDark(css));
    // A dark theme's variant targets its own scope; a light one has no variant to check.
    const variant = new RegExp(`@custom-variant dark[^;]*\\.${scope}`);
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

  it("keeps the Catppuccin banner", () => {
    expect(css).toMatch(/^\/\*! .*Catppuccin/);
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

  it("flattens a plain-disabled solid Button instead of fading it", () => {
    // Half opacity on a saturated fill is muddy under the label (HC-148). The rule is keyed on the
    // plain-disabled marker, so busy (keeps its colour) and blocked (already flat) are untouched.
    const rule = new RegExp(
      `\\.${escapeRe(scope)} \\.disabled\\\\:opacity-50:disabled:is\\(([^)]*)\\)\\s*\\{([^}]*)\\}`,
    ).exec(rules);
    expect(rule?.[1]).toBe(".bg-violet-600, .bg-emerald-600, .bg-red-600");
    expect(rule?.[2]).toMatch(/opacity:\s*1;/);
  });
});

it("keeps Mocha's own canvas and disabled fill", () => {
  const rules = strip(read("theme.css"));
  expect(rules).toMatch(/\.dark \.bg-gray-50\s*\{\s*background-color:\s*#181825;/);
  expect(rules).toMatch(/:is\([^)]*\)\s*\{[^}]*background-color:\s*#45475a;/);
});
