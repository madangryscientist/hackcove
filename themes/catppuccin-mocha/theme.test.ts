import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

const dir = import.meta.dirname;
const read = (file: string): string => readFileSync(`${dir}/${file}`, "utf8");
const pkg = JSON.parse(read("package.json"));
const css = read("theme.css");
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

it("exports theme.css and ships only files that exist", () => {
  expect(pkg.name).toBe("@hackcove/theme-catppuccin-mocha");
  expect(Object.keys(pkg.exports)).toContain("./theme.css");
  expect(pkg.files.filter((file: string) => !existsSync(`${dir}/${file}`))).toEqual([]);
});

it("declares the class-based dark variant and scopes its remaps under .dark", () => {
  expect(css).toContain("@custom-variant dark");
  expect(css).toMatch(/^\.dark\s/m);
});

it("scopes every rule under .dark, apart from the @custom-variant at-rule", () => {
  // An unscoped rule (a bare `.link`) would restyle a consumer's page whatever theme it picked.
  const flat = rules.replace(/@custom-variant[^;]*;/g, "");
  expect(flat).not.toMatch(/@/);
  const selectors = [...flat.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((rule) =>
    (rule[1] ?? "").split(/,(?![^(]*\))/).map((selector) => selector.trim()),
  );
  expect(selectors.length).toBeGreaterThan(1);
  expect(selectors.filter((selector) => !/^\.dark(\s|$)/.test(selector))).toEqual([]);
});

it("leaves the Tailwind import to the consumer", () => {
  expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/@import\s+["']tailwindcss/);
  expect(pkg.peerDependencies.tailwindcss).toBeDefined();
});

it("credits Catppuccin: NOTICE carries its MIT notice and theme.css keeps a banner", () => {
  expect(read("NOTICE")).toContain("Copyright (c) 2021 Catppuccin");
  expect(read("NOTICE")).toContain("Permission is hereby granted");
  expect(css).toMatch(/^\/\*! .*Catppuccin/);
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

it("owns the page canvas and the type faces", () => {
  // AppShell paints `bg-gray-50` (the palette's canvas role) and sets `font-sans`.
  expect(rules).toMatch(/\.dark \.bg-gray-50\s*\{\s*background-color:\s*#181825;/);
  const scope = /^\.dark\s*\{([^{}]*)\}/m.exec(rules)?.[1] ?? "";
  expect(scope).toMatch(/--font-sans:\s*Inter,/);
  expect(scope).toMatch(/--font-mono:\s*ui-monospace,/);
  expect(scope).toMatch(/font-family:\s*var\(--font-sans\)/);
});

it("flattens a plain-disabled solid Button instead of fading it", () => {
  // Half opacity on a pastel fill is muddy under the crust label (HC-148). The rule is keyed on the
  // plain-disabled marker, so busy (keeps its colour) and blocked (already flat) are untouched.
  const rule = /\.dark \.disabled\\:opacity-50:disabled:is\(([^)]*)\)\s*\{([^}]*)\}/.exec(rules);
  expect(rule?.[1]).toBe(".bg-violet-600, .bg-emerald-600, .bg-red-600");
  expect(rule?.[2]).toMatch(/opacity:\s*1;/);
  expect(rule?.[2]).toMatch(/background-color:\s*#45475a;/);
});
