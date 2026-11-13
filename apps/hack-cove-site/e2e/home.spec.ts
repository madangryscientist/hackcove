import { expect, type Page, test } from "@playwright/test";
import { site } from "../src/content/site";
import { setScheme } from "./scheme";

// The home page is the products page: a block per product ready to use, how the slash tools fit,
// a card for each of the rest, the actions linking out, and the cards' labels on one line.
// "Every theme" is both schemes here: the toggle flips the site between the light and the dark
// theme, and the same flip runs on every page.
const productsRegion = (page: Page) => page.getByRole("main");

test("/: one h1, a block for each product ready to use, how they fit, cards for the rest, four links out and two pictures", async ({
  page,
}) => {
  await page.goto("/");
  const region = productsRegion(page);
  await expect(page.getByRole("heading", { level: 1, name: site.home.title })).toBeVisible();
  for (const name of ["Hack Cove UI", "PixelSlash"])
    await expect(region.getByRole("region", { name }).getByRole("img")).toBeVisible();
  await expect(region.getByRole("region", { name: "ToggleSlash" }).locator("pre")).toBeVisible();
  await expect(
    region.getByRole("region", { name: site.home.fit.title }).getByRole("article"),
  ).toHaveCount(3);
  await expect(
    region.getByRole("region", { name: site.home.coming.title }).getByRole("article"),
  ).toHaveCount(2);
  await expect(region.getByRole("link")).toHaveCount(4);
  await expect(region.getByRole("img")).toHaveCount(2);
});

test("/: at 1024px with a 22px default font, each card's status and action stay on one line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  await page.evaluate(() => (document.documentElement.style.fontSize = "22px"));
  const cards = productsRegion(page).getByRole("region", { name: site.home.coming.title });
  for (const el of [
    ...(await cards.getByText(/In early development|Coming soon/).all()),
    ...(await cards.getByRole("link").all()),
  ]) {
    // The distinct line tops of the element's text: a wrapped label has two.
    const lines = await el.evaluate((node) => {
      const tops = new Set<number>();
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(text);
        for (const rect of range.getClientRects()) tops.add(Math.round(rect.top));
      }
      return tops.size;
    });
    expect(lines, await el.innerText()).toBe(1);
  }
});

for (const scheme of ["light", "dark"] as const) {
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
