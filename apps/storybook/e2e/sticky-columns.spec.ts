import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

/** The rail and the aside stay in view as a long page scrolls. */
const desktop = { width: 1280, height: 800 };

async function scrollToEnd(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  // Wait for the scroll to land before reading positions.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight,
      ),
    )
    .toBe(true);
}

test("from md a long SidebarLayout page keeps its rail in view, with railLabel", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--sticky-rail"));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  await scrollToEnd(page);
  expect(await page.evaluate(() => window.scrollY), "the page scrolled").toBeGreaterThan(400);
  await expect(nav.getByRole("link", { name: "Section 8" })).toBeInViewport();
});

test("a SidebarLayout rail taller than the viewport scrolls itself and reaches its last link", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--tall-rail"));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  await scrollToEnd(page);
  const last = nav.getByRole("link", { name: "Section 60", exact: true });
  // The rail is taller than the room: at the page's end its last link is still below the fold.
  await expect(last).not.toBeInViewport();
  // A wheel over the rail scrolls the rail itself, to its last link.
  await nav.getByRole("link", { name: "Section 1", exact: true }).hover();
  await page.mouse.wheel(0, 10_000);
  await expect(last).toBeInViewport();
  // The page still scrolls on its own: the rail did not trap the wheel's work.
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
});

test("from lg a long DetailLayout with stickyAside keeps its aside in view", async ({ page }) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside"));
  const aside = page.getByRole("complementary");
  await aside.waitFor();
  await scrollToEnd(page);
  expect(await page.evaluate(() => window.scrollY), "the page scrolled").toBeGreaterThan(400);
  await expect(aside.getByText("Premium")).toBeInViewport();
});

test("a SidebarLayout containing a DetailLayout with stickyAside keeps both in view", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--with-detail"));
  const rail = page.getByRole("complementary").first();
  const aside = page.getByRole("complementary").last();
  await aside.waitFor();
  await scrollToEnd(page);
  expect(await page.evaluate(() => window.scrollY), "the page scrolled").toBeGreaterThan(400);
  await expect(rail.getByRole("link", { name: "Section 8" })).toBeInViewport();
  await expect(aside.getByText("Blocks")).toBeInViewport();
});

for (const [id, what] of [
  ["page-layouts-sidebarlayout--tall-rail", "rail"],
  ["page-layouts-sidebarlayout--with-detail", "rail and aside"],
  ["page-layouts-detaillayout--sticky-aside", "aside"],
] as const) {
  test(`at 375px (${id}) with the ${what} the page does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(storyUrl(id));
    await page.getByRole("heading", { level: 1 }).waitFor();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      "no sideways overflow",
    ).toBe(true);
  });
}

/** The rail's links, on a desktop, once the story has rendered. */
const railAt = async (page: Page, id: string) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl(id));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  return nav;
};

/**
 * The rail shows where you are: once the layout has hydrated, a rail that scrolls puts its current
 * link in view (the rail's scroller moves, never the page), and the folded disclosure below md
 * names the current link.
 */
test("a SidebarLayout rail with its current link low in the list scrolls it into view, not the page", async ({
  page,
}) => {
  const nav = await railAt(page, "page-layouts-sidebarlayout--current-low");
  const current = nav.getByRole("link", { name: "Section 45", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  // Section 45 starts far below the fold: in view means the rail scrolled to it.
  await expect(current).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY), "the page did not move").toBe(0);
});

test("a SidebarLayout rail whose current link is at the top stays at the top", async ({ page }) => {
  const nav = await railAt(page, "page-layouts-sidebarlayout--tall-rail");
  const current = nav.getByRole("link", { name: "Section 1", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(current).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY), "the page did not move").toBe(0);
});

test("below md the folded rail's summary names the current link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: desktop.height });
  await page.goto(storyUrl("page-layouts-sidebarlayout--current-low"));
  // The summary is the disclosure's own label, found by the text it shows.
  await expect(
    page.getByRole("complementary").getByText("All sections: Section 45", { exact: true }),
  ).toBeVisible();
});
