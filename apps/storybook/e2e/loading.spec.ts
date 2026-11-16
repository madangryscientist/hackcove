import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * Feedback / Loading's `Parts` story, in every theme: while `loading` each owner is busy, its
 * label is in the accessibility tree and no data text shows; flipping the arg lands the data and
 * drops `aria-busy`. A bone pulses, and under reduced motion it is still. Themes are found the way
 * theme.spec.ts finds them, so a new theme is checked with no edit here.
 */
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const STORY = "feedback-loading--parts";

const open = async (page: Page, theme: string, loading: boolean) => {
  await page.goto(
    `/iframe.html?id=${STORY}&viewMode=story&globals=theme:${theme}&args=loading:!${loading}`,
  );
  await page.getByText("Customer").waitFor();
};

const busy = (page: Page) => page.locator("[aria-busy='true']");
const bone = (page: Page) => page.locator("[data-skeleton]").first();

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test.describe(`theme ${theme}`, () => {
    test("while loading the owners are busy and labelled, with no data; landing shows it", async ({
      page,
    }) => {
      await open(page, theme, true);
      expect(await busy(page).count()).toBeGreaterThan(0);
      await expect(page.getByText("Loading the quote")).toBeAttached();
      await expect(page.getByText("Cove Hardware")).toHaveCount(0);
      await expect(page.getByText("R 18 400")).toHaveCount(0);
      expect(await bone(page).getAttribute("aria-hidden")).toBe("true");

      await open(page, theme, false);
      await expect(busy(page)).toHaveCount(0);
      await expect(page.getByText("R 18 400")).toBeVisible();
      await expect(page.getByRole("term").filter({ hasText: "Customer" })).toBeVisible();
      await expect(page.getByRole("definition").filter({ hasText: "Cove Hardware" })).toBeVisible();
    });

    test("a bone pulses, and is still under reduced motion", async ({ page }) => {
      await open(page, theme, true);
      expect(await bone(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("pulse");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, theme, true);
      expect(await bone(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    });
  });
}
