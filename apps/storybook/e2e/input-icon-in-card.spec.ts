import { expect, test, type Locator } from "@playwright/test";
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

for (const { id: theme } of themes) {
  test(`${theme}: a click on an Input's icon in a Card focuses the field`, async ({ page }) => {
    await page.goto(`${story}&globals=theme:${theme}`);
    const fields = page.locator("input");
    await expect(fields).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const icon = fields.nth(i).locator("xpath=preceding-sibling::span[@aria-hidden='true']");
      await expect(icon).toBeVisible();
      const box = await icon.boundingBox();
      if (!box) throw new Error("the icon has no box");
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(fields.nth(i)).toBeFocused();
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
