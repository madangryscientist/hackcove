import { readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The library promises one height per size across every control: the same as an `Input` of that
// size. jsdom has no layout, so this measures the rendered boxes, under every theme (a theme may
// change a font, and a font changes a line height).
const themesDir = `${import.meta.dirname}/../../../themes`;
const themes = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const HEIGHT = new Map([
  ["sm", 26],
  ["md", 38],
  ["lg", 46],
]);

for (const theme of themes) {
  test(`theme ${theme}: every sized control is 26px at sm, 38px at md and 46px at lg`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=ui-control-heights--heights&viewMode=story&globals=theme:${theme}`,
    );
    await page.locator('[data-control="Input"]').first().waitFor();

    const heights = await page.locator("[data-size]").evaluateAll((rows) =>
      rows.map((row) => ({
        size: row.getAttribute("data-size"),
        controls: Object.fromEntries(
          [...row.querySelectorAll("[data-control]")].map((el) => [
            el.getAttribute("data-control"),
            el.getBoundingClientRect().height,
          ]),
        ),
      })),
    );

    expect(heights.map((row) => row.size)).toEqual(["sm", "md", "lg"]);
    const off = heights.flatMap((row) =>
      Object.entries(row.controls)
        .filter(([, height]) => height !== HEIGHT.get(row.size ?? ""))
        .map(([control, height]) => `${control} at ${row.size ?? "?"}: ${String(height)}`),
    );
    expect(Object.keys(heights[0]?.controls ?? {})).toHaveLength(10);
    expect(off).toEqual([]);
  });
}
