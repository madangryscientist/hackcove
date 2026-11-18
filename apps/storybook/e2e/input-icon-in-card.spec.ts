import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

// A Card lifts its fields above a stretched link (`liftInteractive`: `relative z-10`). A click on an
// `Input`'s leading icon still focuses its field, and the clear button is on top of the field, so a
// pointer reaches it (elementFromPoint, the way a pointer reaches the page).
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);
const story = "/iframe.html?id=forms-input--icon-in-card&viewMode=story";

/**
 * Whether the element at the centre of `target` is `target` or inside it. An element that is
 * `pointer-events-none`, which hit testing skips, is made hittable for the probe only.
 */
const isHit = (target: Locator): Promise<boolean> =>
  target.evaluate((el) => {
    const style = el instanceof HTMLElement ? el.style : undefined;
    const before = style?.pointerEvents ?? "";
    if (style) style.pointerEvents = "auto";
    const { left, top, width, height } = el.getBoundingClientRect();
    const hit = document.elementFromPoint(left + width / 2, top + height / 2);
    if (style) style.pointerEvents = before;
    return hit !== null && el.contains(hit);
  });

/** The three fields, each with a leading icon, in the order the story draws them. */
const fields = (page: Page) => [
  page.getByRole("textbox", { name: "Name", exact: true }),
  page.getByRole("searchbox", { name: "Search", exact: true }),
  page.getByRole("searchbox", { name: "Search, filled", exact: true }),
];

/**
 * The leading icons, in field order: each is an aria-hidden svg, so they are found among the hidden
 * images. The clear button's icon comes after them.
 */
const icons = (page: Page) =>
  page.getByRole("region", { name: "Filter stores" }).getByRole("img", { includeHidden: true });

for (const { id: theme } of themes) {
  test(`${theme}: a click on an Input's icon in a Card focuses the field`, async ({ page }) => {
    await page.goto(`${story}&globals=theme:${theme}`);
    await expect(icons(page)).toHaveCount(4);
    for (const [i, field] of fields(page).entries()) {
      const icon = icons(page).nth(i);
      await expect(icon).toBeVisible();
      // A real mouse click at the icon's centre; `force` skips Playwright's check that the icon is
      // the topmost element there, since the field under it is meant to take the click.
      await icon.click({ force: true });
      await expect(field).toBeFocused();
    }
  });

  test(`${theme}: the clear button sits above the field in a Card and clears it`, async ({
    page,
  }) => {
    await page.goto(`${story}&globals=theme:${theme}`);
    const clear = page.getByRole("button", { name: "Clear search" });
    await expect(clear).toBeVisible();
    expect(await isHit(clear)).toBe(true);
    await clear.click();
    await expect(page.getByLabel("Search, filled")).toHaveValue("");
    await expect(page.getByLabel("Search, filled")).toBeFocused();
  });
}
