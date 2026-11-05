import { expect, test, type Locator, type Page } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

const boxOf = async (locator: Locator, what: string) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${what} has no box`);
  return box;
};

/**
 * The rail and the aside stay in view as a long page scrolls. The shell's header is
 * `position: sticky`, so "in view" is below its bottom edge and above the viewport's.
 */
const desktop = { width: 1280, height: 800 };

async function scrollToEnd(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  // A scroll is async in WebKit and Firefox: wait for it to land.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight,
      ),
    )
    .toBe(true);
}

/** The element, its box and the header's bottom, read together so they are the same frame. */
async function inView(page: Page, element: Locator, what: string) {
  const header = await boxOf(page.getByRole("banner"), "header");
  const box = await boxOf(element, what);
  const viewport = page.viewportSize();
  const bottomEdge = header.y + header.height;
  expect(box.y, `${what} is below the header`).toBeGreaterThanOrEqual(bottomEdge);
  expect(box.y + box.height, `${what} is above the viewport's end`).toBeLessThanOrEqual(
    viewport?.height ?? 0,
  );
}

test("from md a long SidebarLayout page keeps its rail in view under the header, with railLabel", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--sticky-rail"));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  const rail = page.getByRole("complementary");
  const before = await boxOf(rail, "rail");
  await scrollToEnd(page);
  expect(await page.evaluate(() => window.scrollY), "the page scrolled").toBeGreaterThan(400);
  await inView(page, rail, "rail");
  await expect(nav.getByRole("link", { name: "Section 8" })).toBeInViewport();
  // The x and width are the unscrolled rail's, so it stays on the page's edge.
  const after = await boxOf(rail, "rail");
  expect(after.x).toBe(before.x);
  expect(after.width).toBe(224);
});

test("a SidebarLayout rail taller than the viewport scrolls itself and reaches its last link", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--tall-rail"));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  const rail = page.getByRole("complementary");
  const scroller = rail.locator("> div");
  expect(
    await scroller.evaluate((el) => el.scrollHeight > el.clientHeight),
    "the rail is taller than the room",
  ).toBe(true);
  await scrollToEnd(page);
  await inView(page, rail, "rail");
  const last = nav.getByRole("link", { name: "Section 60", exact: true });
  await scroller.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(last).toBeInViewport();
  await inView(page, last, "last link");
  // The page still scrolls on its own: the rail did not trap the wheel's work.
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
});

test("a focus ring on a rail link is not clipped by the rail's own scroll", async ({ page }) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-sidebarlayout--tall-rail"));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.waitFor();
  const scroller = page.getByRole("complementary").locator("> div");
  const ringFits = async (link: Locator) => {
    // Tab, not focus(): `:focus-visible` is what draws the ring.
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    return link.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const out = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
      const clip = el.closest("aside")?.firstElementChild?.getBoundingClientRect();
      if (!clip) return { out, fits: false };
      return {
        out,
        fits:
          rect.left - out >= clip.left &&
          rect.right + out <= clip.right &&
          rect.top - out >= clip.top &&
          rect.bottom + out <= clip.bottom,
      };
    });
  };
  expect(await ringFits(nav.getByRole("link", { name: "Section 1", exact: true }))).toEqual({
    out: 4,
    fits: true,
  });
  await scroller.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  expect(await ringFits(nav.getByRole("link", { name: "Section 60", exact: true }))).toEqual({
    out: 4,
    fits: true,
  });
});

test("from lg a long DetailLayout with stickyAside keeps its aside in view under the header", async ({
  page,
}) => {
  await page.setViewportSize(desktop);
  await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside"));
  const aside = page.getByRole("complementary");
  await aside.waitFor();
  await scrollToEnd(page);
  expect(await page.evaluate(() => window.scrollY), "the page scrolled").toBeGreaterThan(400);
  await inView(page, aside, "aside");
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
  await inView(page, rail, "rail");
  await inView(page, aside, "aside");
  await expect(rail.getByRole("link", { name: "Section 8" })).toBeInViewport();
  await expect(aside.getByText("Blocks")).toBeInViewport();
});

for (const [id, what] of [
  ["page-layouts-sidebarlayout--tall-rail", "rail"],
  ["page-layouts-sidebarlayout--with-detail", "rail and aside"],
  ["page-layouts-detaillayout--sticky-aside", "aside"],
] as const) {
  test(`at 375px (${id}) the ${what} stacks: nothing sticks and the page does not overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(storyUrl(id));
    await page.getByRole("heading", { level: 1 }).waitFor();
    const asides = await page.getByRole("complementary").evaluateAll((els) =>
      els.map((el) => ({
        position: getComputedStyle(el).position,
        scroller: getComputedStyle(el.firstElementChild ?? el).overflowY,
        maxHeight: getComputedStyle(el.firstElementChild ?? el).maxHeight,
      })),
    );
    expect(asides.length).toBeGreaterThan(0);
    for (const aside of asides)
      expect(aside).toEqual({ position: "static", scroller: "visible", maxHeight: "none" });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      "no sideways overflow",
    ).toBe(true);
  });
}

test("a DetailLayout aside stacks under lg even with stickyAside", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside"));
  const aside = page.getByRole("complementary");
  await aside.waitFor();
  expect(await aside.evaluate((el) => getComputedStyle(el).position)).toBe("static");
});
