import { test } from "@playwright/test";

test("acts through selector strings", async ({ page }) => {
  await page.click("#save"); // expect: ui-testing/no-selector-actions
  await page.fill(".name", "Ada"); // expect: ui-testing/no-selector-actions
  await page.press("#name", "Enter"); // expect: ui-testing/no-selector-actions
  await page.hover(`nav a`); // expect: ui-testing/no-selector-actions
  await page.textContent("h1"); // expect: ui-testing/no-selector-actions
  await page.$("a"); // expect: ui-testing/no-selector-actions
  await page.$$eval("li", (items) => items.length); // expect: ui-testing/no-selector-actions
  await page.selectOption("select#size", "large"); // expect: ui-testing/no-selector-actions
});
