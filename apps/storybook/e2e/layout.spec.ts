import { expect, test, type Page } from "@playwright/test";

/**
 * How the page layouts look (the title x, the form column, the rail, the canvas, the centred card)
 * is the PixelSlash shot's job. What stays here is the rail's fold, and that a phone width never
 * scrolls sideways.
 */
const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

const open = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
  await page.getByRole("heading", { level: 1 }).waitFor();
  return {
    nav: page.getByRole("navigation", { name: "Sections" }),
    summary: page.getByText("All sections"),
  };
};

test("at 375px a SidebarLayout with railLabel folds the rail behind its summary, which opens it", async ({
  page,
}) => {
  const { nav, summary } = await open(page, 375);
  await expect(nav).toBeHidden();
  await expect(summary).toBeVisible();
  await summary.click();
  await expect(nav).toBeVisible();
});

for (const width of [768, 1280]) {
  test(`at ${width}px a SidebarLayout with railLabel shows the rail and no summary`, async ({
    page,
  }) => {
    const { nav, summary } = await open(page, width);
    await expect(summary).toBeHidden();
    await expect(nav).toBeVisible();
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
