import { readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Same source of truth as the toolbar switcher: one folder per theme under themes/.
const themes = readdirSync(`${import.meta.dirname}/../../../themes`, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const pillStory = "ui-primitives--pills";

async function open(page: Page, theme: string) {
  await page.goto(`/iframe.html?id=${pillStory}&viewMode=story&globals=theme:${theme}`);
  await page.getByText("amber", { exact: true }).waitFor();
}

const background = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);

async function snapshot(page: Page, theme: string) {
  await open(page, theme);
  return {
    dark: await page
      .locator("[data-theme]")
      .first()
      .evaluate((el) => el.classList.contains("dark")),
    pill: await page
      .getByText("amber", { exact: true })
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    surface: await background(page, "[data-theme] > div"),
  };
}

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

test("default is the components' own light look: no .dark scope", async ({ page }) => {
  const light = await snapshot(page, "default");
  expect(light.dark).toBe(false);
  expect(light.surface).toBe("rgb(255, 255, 255)");
});

for (const theme of themes) {
  test(`theme ${theme} remaps the page surface and the amber Pill under .dark`, async ({
    page,
  }) => {
    const light = await snapshot(page, "default");
    const themed = await snapshot(page, theme);

    expect(themed.dark).toBe(true);
    expect(themed.surface).not.toBe(light.surface);
    expect(themed.pill).not.toBe(light.pill);
  });
}
