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
