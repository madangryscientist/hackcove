import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { themeScope } from "../.storybook/scope";

// Same source of truth as the toolbar switcher: one folder per theme under themes/.
const themesDir = `${import.meta.dirname}/../../../themes`;
const themes = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const pillStory = "ui-primitives--pills";

async function open(page: Page, theme: string) {
  await page.goto(`/iframe.html?id=${pillStory}&viewMode=story&globals=theme:${theme}`);
  await page.getByText("amber", { exact: true }).waitFor();
}

const pillBackground = (page: Page, tone: string) =>
  page.getByText(tone, { exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);

async function snapshot(page: Page, theme: string) {
  await open(page, theme);
  return {
    classes: await page
      .locator("[data-theme]")
      .first()
      .evaluate((el) => [...el.classList]),
    amber: await pillBackground(page, "amber"),
    slate: await pillBackground(page, "slate"),
  };
}

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

test("default is the components' own look: no theme scope", async ({ page }) => {
  const plain = await snapshot(page, "default");
  expect(plain.classes).toEqual([]);
});

for (const theme of themes) {
  const scope = themeScope(readFileSync(`${themesDir}/${theme}/theme.css`, "utf8"));

  test(`theme ${theme} remaps the slate and amber Pills under its own scope`, async ({ page }) => {
    const plain = await snapshot(page, "default");
    const themed = await snapshot(page, theme);

    expect(scope).toBeDefined();
    expect(themed.classes).toEqual([scope]);
    expect(themed.slate).not.toBe(plain.slate);
    expect(themed.amber).not.toBe(plain.amber);
  });
}
