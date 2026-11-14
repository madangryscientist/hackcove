import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * NavigationProgress over an AppShell, in every theme: the bar sits on the viewport's top edge,
 * is at most 4px tall and moves nothing (the header's box is the same with the bar off), it is an
 * indeterminate progressbar named "Loading page", and under reduced motion it is a still bar.
 * Themes are found the way theme.spec.ts finds them, so a new theme is checked with no edit here.
 */
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const STORY = "feedback-navigationprogress--default";

const open = async (page: Page, theme: string, active: boolean) => {
  await page.goto(
    `/iframe.html?id=${STORY}&viewMode=story&globals=theme:${theme}&args=active:!${active}`,
  );
  await page.getByRole("banner").waitFor();
};

const bar = (page: Page) => page.getByRole("progressbar", { name: "Loading page" });

const headerBox = async (page: Page) => {
  const box = await page.getByRole("banner").boundingBox();
  if (!box) throw new Error("the header has no box");
  return box;
};

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test.describe(`theme ${theme}`, () => {
    test("the bar is on the top edge, thin, indeterminate, and moves nothing", async ({ page }) => {
      await open(page, theme, false);
      await expect(bar(page)).toHaveCount(0);
      const without = await headerBox(page);

      await open(page, theme, true);
      await expect(bar(page)).toBeVisible();
      const box = await bar(page).boundingBox();
      expect(box?.y).toBe(0);
      expect(box?.height).toBeLessThanOrEqual(4);
      await expect(bar(page)).not.toHaveAttribute("aria-valuenow", /.*/);
      expect(await headerBox(page)).toEqual(without);

      // The 150ms wait is the stylesheet's own delay, read off the element, not waited for.
      expect(await bar(page).evaluate((el) => getComputedStyle(el).animationDelay)).toBe("0.15s");

      // Visibly its own colour: the accent fill is not the header's.
      const fill = bar(page).locator("[data-navigation-progress-bar]");
      const [fillColour, headerColour] = await Promise.all([
        fill.evaluate((el) => getComputedStyle(el).backgroundColor),
        page.getByRole("banner").evaluate((el) => getComputedStyle(el).backgroundColor),
      ]);
      expect(fillColour).not.toBe(headerColour);
    });

    test("under reduced motion it is a still bar", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, theme, true);
      await expect(bar(page)).toBeVisible();
      const fill = bar(page).locator("[data-navigation-progress-bar]");
      expect(await fill.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
      // The animated bar is 40% wide and slides; the still one fills the whole bar.
      const [fillBox, barBox] = await Promise.all([fill.boundingBox(), bar(page).boundingBox()]);
      expect(fillBox?.width).toBe(barBox?.width);
      expect(fillBox?.x).toBe(barBox?.x);
    });
  });
}
