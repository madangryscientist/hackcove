import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

const COLOUR =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|outline|ring|accent|fill|stroke|decoration|divide)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?(?![\w-])/g;

const palette: Record<string, string[]> = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "palette.json"), "utf8"),
);
const allowed = new Set(Object.values(palette).flat());

it("uses no colour utility outside palette.json", () => {
  const sources = readdirSync(import.meta.dirname).filter(
    (file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"),
  );
  expect(sources.length).toBeGreaterThan(0);
  const notInPalette = sources.flatMap((file) => {
    const source = readFileSync(join(import.meta.dirname, file), "utf8");
    return (source.match(COLOUR) ?? [])
      .filter((utility) => !allowed.has(utility))
      .map((utility) => `${file}: ${utility}`);
  });
  expect(notInPalette).toEqual([]);
});
