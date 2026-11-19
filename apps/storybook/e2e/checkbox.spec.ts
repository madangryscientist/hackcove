import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@slashsuite/themes-shared/files";

// One theme per CSS file in themes/, found by the glob like the toolbar switcher does.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

async function open(page: Page, story: string, theme: string) {
  await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:${theme}`);
  await page.getByRole("checkbox").first().waitFor();
}

/**
 * The drawn check mark inside a checkbox's label or table cell: an aria-hidden svg, so it is found
 * among the hidden images.
 */
const mark = (holder: Locator) => holder.getByRole("img", { includeHidden: true });

/** Where each ticked box in the story lives: its label in the Card, its cell in the table. */
const ticked = [
  {
    name: "Email me when a shop I follow posts",
    holder: (page: Page) => page.getByText("Email me when a shop I follow posts", { exact: true }),
  },
  {
    name: "Select Hack Cove Finds",
    holder: (page: Page) => page.getByRole("cell", { name: "Select Hack Cove Finds" }),
  },
];

/**
 * Whether the element at the centre of `target` is `target` or inside it. The tick is
 * `pointer-events-none`, which hit testing skips, so it is made hittable for the probe only: what
 * is left is its paint order against the lifted field (a Card or table row is `isolate`, and its
 * fields sit at `z-10`).
 */
const isHit = (target: Locator): Promise<boolean> =>
  target.evaluate((el) => {
    // The tick is an svg, so an HTML or an SVG element's inline style.
    const style = el instanceof HTMLElement || el instanceof SVGElement ? el.style : undefined;
    const before = style?.pointerEvents ?? "";
    if (style) style.pointerEvents = "auto";
    const { left, top, width, height } = el.getBoundingClientRect();
    const hit = document.elementFromPoint(left + width / 2, top + height / 2);
    if (style) style.pointerEvents = before;
    return hit !== null && el.contains(hit);
  });

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test(`theme ${theme}: a ticked Checkbox in a Card and a table row draws its tick above the field`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--in-card", theme);
    for (const { name, holder } of ticked) {
      const box = page.getByRole("checkbox", { name });
      await expect(box).toBeChecked();
      const drawn = mark(holder(page));
      await expect(drawn).toBeVisible();
      expect(await isHit(drawn), `${name}: the tick is the topmost element at its centre`).toBe(
        true,
      );
    }
  });

  test(`theme ${theme}: a click on an unticked Checkbox in a Card toggles it`, async ({ page }) => {
    await open(page, "forms-checkbox--in-card", theme);
    const box = page.getByRole("checkbox", { name: "Weekly summary" });
    await expect(box).not.toBeChecked();
    await box.click();
    await expect(box).toBeChecked();
    await box.click();
    await expect(box).not.toBeChecked();
  });

  test(`theme ${theme}: a click on a ticked box in a Card or table row toggles it`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--in-card", theme);
    for (const name of ["Email me when a shop I follow posts", "Select Hack Cove Finds"]) {
      const box = page.getByRole("checkbox", { name });
      await expect(box).toBeChecked();
      await box.click();
      await expect(box).not.toBeChecked();
      await box.click();
      await expect(box).toBeChecked();
    }
  });
}

test("Checkbox: clicking the label or pressing Space toggles it", async ({ page }) => {
  await open(page, "forms-checkbox--unchecked", themes[0]?.id ?? "");
  const box = page.getByRole("checkbox", { name: "Open now" });
  await page.getByText("Open now", { exact: true }).click();
  await expect(box).toBeChecked();
  await box.focus();
  await page.keyboard.press("Space");
  await expect(box).not.toBeChecked();
});

test("Checkbox: Tab moves keyboard focus onto it", async ({ page }) => {
  await open(page, "forms-checkbox--unchecked", themes[0]?.id ?? "");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox", { name: "Open now" })).toBeFocused();
});
