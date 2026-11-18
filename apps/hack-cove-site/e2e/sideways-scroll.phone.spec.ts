import { expect, test } from "@playwright/test";

// Content off the side of a phone cannot be reached. These two pages hold this check until the page
// loop checks it on every page.
for (const path of ["/", "/ui/button/"]) {
  test(`${path}: nothing scrolls sideways on a phone`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
