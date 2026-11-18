import { expect, test } from "@playwright/test";
import { themeScope } from "@hackcove/themes-shared/scope";
import { themeList } from "./scheme";

// The Getting started page's theme list, as a reader sees it: it is read from themes/*.css, so its
// length is not fixed.

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
