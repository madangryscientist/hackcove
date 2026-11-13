import { expect, test } from "@playwright/test";
import { themeScope } from "@hackcove/themes-shared/scope";
import { componentSections } from "../src/content/components/index";
import { themeList } from "./scheme";

// The Getting started page's two index blocks, as a reader sees them: the theme list is read from
// themes/*.css so its length is not fixed, and the group cards are as tall as their own links.

// A table row per theme wraps for any count, where a two-column grid leaves the odd one alone on an
// empty row.
test("/ui/: one table row per theme, each with its import and its class, and no empty cell", async ({
  page,
}) => {
  await page.goto("/ui/");
  const table = page.getByRole("region", { name: "Themes", exact: true }).getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(themeList.length + 1);
  for (const theme of themeList) {
    const specifier = `@hackcove/themes/${theme.id}.css`;
    const scope = themeScope(theme.css) ?? "";
    expect(scope, `${theme.id}: no scope class in its CSS`).not.toBe("");
    const row = table.getByRole("row").filter({ hasText: specifier });
    await expect(row).toHaveCount(1);
    const cells = row.getByRole("cell");
    await expect(cells).toHaveCount(3);
    const empty = await cells.evaluateAll(
      (all) => all.filter((cell) => !cell.textContent?.trim()).length,
    );
    expect(empty, `${theme.id}: an empty cell`).toBe(0);
    // The cells exactly: the specifier holds the theme's id, so a scope class that is a substring
    // of it would pass a looser check with the class cell empty.
    await expect(cells.nth(1)).toHaveText(scope);
    await expect(cells.nth(2)).toHaveText(specifier);
  }
});

// One group per row: no card is stretched to a partner's height, and the band under a card's last
// link is its own padding, not the empty bottom a stretched card leaves.
for (const width of [1280, 390]) {
  test(`at ${width}px the component groups stack, and no card ends on an empty band`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui/");
    const cards = page
      .getByRole("region", { name: "Components", exact: true })
      .getByRole("article");
    await expect(cards).toHaveCount(componentSections.length);
    const boxes = await cards.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        const lists = el.querySelectorAll("ul");
        const last = lists[lists.length - 1];
        return {
          top: box.top,
          bottom: box.bottom,
          left: box.left,
          slack: last ? box.bottom - last.getBoundingClientRect().bottom : Infinity,
        };
      }),
    );
    for (const [index, box] of boxes.entries()) {
      expect(box.left, `card ${index}: left edge`).toBeCloseTo(boxes[0]?.left ?? 0, 0);
      if (index > 0) {
        expect(box.top, `card ${index}: starts below card ${index - 1}`).toBeGreaterThanOrEqual(
          boxes[index - 1]?.bottom ?? Infinity,
        );
      }
      // Under 24px is the card's own bottom padding: an empty band taller than one line of links fails.
      expect(box.slack, `card ${index}: empty band under its last link`).toBeLessThan(24);
    }
  });
}
