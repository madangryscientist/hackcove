import { expect, test, type Locator } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

// A Card lifts its fields above a stretched link (`liftInteractive`: `relative z-10`), and a field
// has an opaque background. The leading icon of an `Input` must rank above the lifted field, or the
// field paints over it and the gutter reads as a hole. Asserted with elementFromPoint, the way a
// pointer reaches the page: the icon, not the field, is on top at the icon's centre. Run in every
// theme, since the field's paint is themed.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);
const story = "/iframe.html?id=forms-input--icon-in-card&viewMode=story";

/**
 * Whether the element at the centre of `target` is `target` or inside it. The icon is
 * `pointer-events-none`, which hit testing skips, so it is made hittable for the probe only: what
 * is left is its paint order against the field.
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
  test(`${theme}: an Input's icon in a Card is above the field and a click on it focuses the field`, async ({
    page,
  }) => {
    await page.goto(`${story}&globals=theme:${theme}`);
    const fields = page.locator("input");
    await expect(fields).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const icon = fields.nth(i).locator("xpath=preceding-sibling::span[@aria-hidden='true']");
      await expect(icon).toBeVisible();
      expect(await isHit(icon), `field ${i}: the icon is the topmost element at its centre`).toBe(
        true,
      );
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

test("a placeholder longer than the field ends with an ellipsis", async ({ page }) => {
  await page.goto("/iframe.html?id=forms-input--long-placeholder&viewMode=story");
  const field = page.getByLabel("Search");
  await expect(field).toBeVisible();
  expect(await field.evaluate((el) => getComputedStyle(el).textOverflow)).toBe("ellipsis");
});
