import { expect, test } from "@playwright/test";

test.only("focused", async () => {}); // expect: playwright/no-focused-test
test.skip("skipped", async () => {}); // expect: playwright/no-skipped-test
test.fixme("fixme", async () => {}); // expect: playwright/no-skipped-test

test("waits on a clock and finds by selector", async ({ page }) => {
  await page.locator(".card").click(); // expect: playwright/no-raw-locators
  await page.waitForSelector("#ready"); // expect: playwright/no-wait-for-selector
  await page.waitForTimeout(500); // expect: playwright/no-wait-for-timeout
  await page.waitForLoadState("networkidle"); // expect: playwright/no-networkidle
  const box = await page.getByRole("dialog").boundingBox(); // expect: no-restricted-properties
  expect(box).not.toBeNull();
});

test("branches", async ({ page, isMobile }) => {
  if (isMobile) {
    // expect: playwright/no-conditional-in-test
    await expect(page.getByRole("menu")).toBeVisible(); // expect: playwright/no-conditional-expect
  }
});

test("asserts look with a matcher", async ({ page }) => {
  const nav = page.getByRole("navigation");
  await expect(nav).toHaveClass(/sticky/); // expect: playwright/no-restricted-matchers
  await expect(nav).toHaveCSS("position", "sticky"); // expect: playwright/no-restricted-matchers
  await expect(page).toHaveScreenshot(); // expect: playwright/no-restricted-matchers
});
