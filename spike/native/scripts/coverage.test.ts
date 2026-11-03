/** Exit proof for D3: the generator maps 100% of palette.json for every theme folder and the default. */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generate, readThemes } from "./generate-themes";

const { palette, themes, unmapped } = generate();
const committed = JSON.parse(
  readFileSync(resolve(import.meta.dir, "../src/generated/themes.json"), "utf8"),
);

describe("generated theme maps", () => {
  test("one map per themes/* folder, plus default", () => {
    expect(Object.keys(themes).sort()).toEqual(
      ["default", ...readThemes().map((t) => t.name)].sort(),
    );
  });

  for (const [name, map] of Object.entries(themes)) {
    test(`${name}: every palette.json utility has a native style`, () => {
      expect(palette.filter((u) => !(u in map.utilities))).toEqual([]);
    });
    test(`${name}: every value is something RN parses (hex, rgba, number; no oklch, no var())`, () => {
      const values = [
        ...Object.values(map.utilities),
        ...map.compounds.map((c) => c.style),
      ].flatMap((s) => Object.values(s));
      for (const v of values) {
        if (typeof v === "number") continue;
        expect(v).toMatch(/^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\)|transparent|\d{3})$/i);
      }
    });
  }

  test("nothing in a theme.css is dropped without being listed", () => {
    expect(unmapped).toEqual([]);
  });

  test("src/generated/themes.json is up to date", () => {
    expect(committed).toEqual(JSON.parse(JSON.stringify({ palette, themes })));
  });
});
