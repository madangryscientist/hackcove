import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

const dir = import.meta.dirname;
const read = (file: string): string => readFileSync(`${dir}/${file}`, "utf8");
const pkg = JSON.parse(read("package.json"));
const css = read("theme.css");

it("exports theme.css and ships only files that exist", () => {
  expect(pkg.name).toBe("@hackcove/theme-catppuccin-mocha");
  expect(Object.keys(pkg.exports)).toContain("./theme.css");
  expect(pkg.files.filter((file: string) => !existsSync(`${dir}/${file}`))).toEqual([]);
});

it("declares the class-based dark variant and scopes its remaps under .dark", () => {
  expect(css).toContain("@custom-variant dark");
  expect(css).toMatch(/^\.dark\s/m);
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
