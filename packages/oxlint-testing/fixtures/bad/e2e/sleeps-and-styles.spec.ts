import { expect, test } from "@playwright/test";

test("sleeps and reads styles", async ({ page }) => {
  await new Promise((done) => setTimeout(done, 100)); // expect: no-restricted-globals
  setInterval(() => undefined, 100); // expect: no-restricted-globals
  await Bun.sleep(100); // expect: no-restricted-properties
  const classes = await page.getByRole("tab").evaluate((tab) => tab.className); // expect: no-restricted-properties
  expect(classes).toBe("active");
  await page.getByRole("tab").evaluate((tab) => window.getComputedStyle(tab).color); // expect: no-restricted-properties
  await page.getByRole("tab").evaluate((tab) => getComputedStyle(tab).color); // expect: no-restricted-globals
  await page.getByRole("tab").evaluate((tab) => tab.classList.contains("on")); // expect: no-restricted-properties
});
