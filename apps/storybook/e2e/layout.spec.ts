import { expect, test } from "@playwright/test";

/**
 * How the page layouts look (the title x, the form column, the rail, the canvas, the centred card)
 * is the PixelSlash shot's job. What stays here is the rail's fold, and that a phone width never
 * scrolls sideways.
 */
const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

for (const width of [375, 768, 1280]) {
  test(`at ${width}px a SidebarLayout with railLabel folds the rail below md and shows it from md`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    const title = page.getByRole("heading", { level: 1 });
    await title.waitFor();
    const nav = page.getByRole("navigation", { name: "Sections" });
    const summary = page.getByText("All sections");
    if (width < 768) {
      await expect(nav).toBeHidden();
      await expect(summary).toBeVisible();
      await summary.click();
      await expect(nav).toBeVisible();
    } else {
      await expect(summary).toBeHidden();
      await expect(nav).toBeVisible();
    }
  });
}

test("at 375 a Stack align start with a long paragraph, a long token and a button leaves no sideways scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(storyUrl("layout-stack--align-start"));
  await expect(page.getByRole("button", { name: "Copy the key" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
