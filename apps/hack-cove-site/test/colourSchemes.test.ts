import { readdirSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";
import { declaresDark, themeScope } from "@hackcove/themes-shared";
import { colourSchemeHeadScript, schemes } from "../src/content/colourSchemes";

const themesDir = `${import.meta.dirname}/../../../themes`;
const folders = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();
const cssOf = (folder: string) => readFileSync(`${themesDir}/${folder}/theme.css`, "utf8");

describe("light/dark schemes", () => {
  test("light and dark are the first themes by folder order that do and do not declare the dark variant", () => {
    const first = (dark: boolean) => folders.find((f) => declaresDark(cssOf(f)) === dark) ?? "";
    expect(schemes).toEqual({
      light: themeScope(cssOf(first(false))),
      dark: themeScope(cssOf(first(true))),
    });
    expect(schemes.light).not.toBe(schemes.dark);
  });

  test("the dark theme is scoped under .dark, which is the class ui's pre-paint script sets", () => {
    expect(schemes.dark).toBe("dark");
  });

  test("the head script keeps ui's stored-choice-else-system logic and adds the light scope class", () => {
    expect(colourSchemeHeadScript).toContain("prefers-color-scheme: dark");
    expect(colourSchemeHeadScript).toContain("hackcove:colour-scheme");
    expect(colourSchemeHeadScript).toContain(
      `classList.toggle(${JSON.stringify(schemes.light)},!document.documentElement.classList.contains("dark"))`,
    );
  });
});

/** Run the head script against a fake `<html>`, `localStorage` and `matchMedia`. */
function run({ stored, systemDark }: { stored?: string; systemDark: boolean }) {
  const classes = new Set(["dark"]); // the server renders dark
  const root = {
    classList: {
      contains: (c: string) => classes.has(c),
      toggle: (c: string, on?: boolean) => {
        if (on === undefined ? !classes.has(c) : on) classes.add(c);
        else classes.delete(c);
      },
    },
    style: {} as { colorScheme?: string },
  };
  runInNewContext(colourSchemeHeadScript, {
    document: { documentElement: root },
    localStorage: { getItem: () => stored ?? null },
    matchMedia: () => ({ matches: systemDark }),
  });
  return { classes: [...classes], colorScheme: root.style.colorScheme };
}

describe("the head script", () => {
  test("a first visit follows prefers-color-scheme", () => {
    expect(run({ systemDark: true })).toEqual({ classes: ["dark"], colorScheme: "dark" });
    expect(run({ systemDark: false })).toEqual({
      classes: [schemes.light],
      colorScheme: "light",
    });
  });

  test("a remembered choice beats the system", () => {
    expect(run({ stored: "light", systemDark: true }).classes).toEqual([schemes.light]);
    expect(run({ stored: "dark", systemDark: false }).classes).toEqual(["dark"]);
  });

  test("an old saved theme-picker value is ignored", () => {
    expect(run({ stored: "thrifty-paper", systemDark: false }).classes).toEqual([schemes.light]);
    expect(run({ stored: "catppuccin-mocha", systemDark: true }).classes).toEqual(["dark"]);
  });
});
