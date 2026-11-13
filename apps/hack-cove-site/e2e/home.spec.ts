import { expect, type Page, test } from "@playwright/test";
import { site } from "../src/content/site";
import { setScheme } from "./scheme";

// The home page is the products page: one card per product, the actions linking out, and the
// actions of a row on one line. "Every theme" is both schemes here: the toggle flips the site
// between the light and the dark theme, and the same flip runs on every page.
const productsRegion = (page: Page) => page.getByRole("main");

test("/: the page has a Products h1 and a card per product, four actions that link out and one picture", async ({
  page,
}) => {
  await page.goto("/");
  const region = productsRegion(page);
  await expect(page.getByRole("heading", { level: 1, name: "Products" })).toBeVisible();
  await expect(region.getByRole("article")).toHaveCount(site.products.length);
  await expect(region.getByRole("link")).toHaveCount(4);
  await expect(region.getByRole("img")).toHaveCount(1);
  await expect(region.getByRole("img")).toBeVisible();
});

for (const scheme of ["light", "dark"] as const) {
  test(`/: at 1280px the four card actions share one bottom edge, in the ${scheme} theme`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await setScheme(page, scheme);
    const bottoms = await productsRegion(page)
      .getByRole("link")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
    expect(bottoms).toHaveLength(4);
    expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(1);
  });

  test(`/: at 390px nothing scrolls sideways, in the ${scheme} theme`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await setScheme(page, scheme);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
