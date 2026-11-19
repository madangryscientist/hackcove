import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@slashsuite/themes-shared/files";

/**
 * From `md` a nav too wide for the header row folds into the Menu, as on a phone, and comes back
 * when the screen is wide enough again. Measured by the row's own size, so a resize drives it both
 * ways. Themes are found the way the toolbar switcher finds them, so a new theme is checked with no edit here.
 */
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const STORY = "layout-appshell--nav-folds";
const LINKS = 10;

const open = async (page: Page, id: string, theme: string, width: number) => {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  await page.getByRole("banner").waitFor();
};

// The Menu is a native `<details>` (a group); its `<summary>` is the button, found by its text.
const menu = (page: Page) => page.getByRole("banner").getByRole("group");
const menuButton = (page: Page) => page.getByRole("banner").getByText("Menu", { exact: true });
const rowLink = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: "Settings", exact: true });

const sideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test.describe(`theme ${theme}`, () => {
    test("at 1280 the nav is in the row and no Menu button shows", async ({ page }) => {
      await open(page, STORY, theme, 1280);
      await expect(rowLink(page)).toBeVisible();
      await expect(menuButton(page)).toBeHidden();
      expect(await sideways(page)).toBeLessThanOrEqual(0);
    });

    test("at 900 the nav folds: the Menu lists every link and following one closes it", async ({
      page,
    }) => {
      await open(page, STORY, theme, 900);
      await expect(menuButton(page)).toBeVisible();
      expect(await sideways(page)).toBeLessThanOrEqual(0);
      await menuButton(page).click();
      await expect(menu(page)).toHaveJSProperty("open", true);
      await expect(menu(page).getByRole("link")).toHaveCount(LINKS);
      await menu(page).getByRole("link", { name: "Audit" }).click();
      await expect(menu(page)).toHaveJSProperty("open", false);
      expect(await sideways(page)).toBeLessThanOrEqual(0);
    });
  });
}

test("resizing from 900 to 1280 and back follows, both ways", async ({ page }) => {
  await open(page, STORY, "default", 900);
  await expect(menuButton(page)).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(rowLink(page)).toBeVisible();
  await expect(menuButton(page)).toBeHidden();
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(menuButton(page)).toBeVisible();
  await expect(rowLink(page)).toBeHidden();
  expect(await sideways(page)).toBeLessThanOrEqual(0);
});

for (const id of ["layout-appshell--long-page", "layout-appshell--header-slots"]) {
  test(`${id} fits at 1280: no Menu button`, async ({ page }) => {
    await open(page, id, "default", 1280);
    await expect(menuButton(page)).toBeHidden();
  });
}
