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

/**
 * A sticky column that scrolls fades the edge it can still scroll to (`useScrollEdges`): the scroller
 * carries `data-more-start` / `data-more-end` and a `mask-image` while there is more; a column that
 * fits carries neither.
 */
const fadeOf = (scroller: Locator) =>
  scroller.evaluate((el) => ({
    start: el.hasAttribute("data-more-start"),
    end: el.hasAttribute("data-more-end"),
    mask: getComputedStyle(el).maskImage,
  }));

const scrollerAt = async (page: Page, id: string, width = desktop.width) => {
  await page.setViewportSize({ width, height: desktop.height });
  await page.goto(storyUrl(id));
  const scroller = page.getByRole("complementary").first().locator("> div");
  await scroller.waitFor();
  return scroller;
};

for (const [id, what] of [
  ["page-layouts-sidebarlayout--tall-rail", "SidebarLayout rail"],
  ["page-layouts-detaillayout--sticky-aside-text", "DetailLayout stickyAside"],
] as const) {
  test(`the ${what} fades the end at the top of its scroll and the start at the end`, async ({
    page,
  }) => {
    const scroller = await scrollerAt(page, id);
    expect(
      await scroller.evaluate((el) => el.scrollHeight > el.clientHeight),
      "the column is taller than the room",
    ).toBe(true);
    await expect.poll(() => fadeOf(scroller).then((f) => [f.start, f.end])).toEqual([false, true]);
    expect((await fadeOf(scroller)).mask).not.toBe("none");

    await scroller.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await expect.poll(() => fadeOf(scroller).then((f) => [f.start, f.end])).toEqual([true, false]);
    expect((await fadeOf(scroller)).mask).not.toBe("none");

    // Halfway, both edges fade.
    await scroller.evaluate((el) => el.scrollTo(0, (el.scrollHeight - el.clientHeight) / 2));
    await expect.poll(() => fadeOf(scroller).then((f) => [f.start, f.end])).toEqual([true, true]);
  });
}

for (const [id, what] of [
  ["page-layouts-sidebarlayout--sticky-rail", "SidebarLayout rail"],
  ["page-layouts-detaillayout--sticky-aside", "DetailLayout stickyAside"],
] as const) {
  test(`the ${what} that fits its box has no fade`, async ({ page }) => {
    const scroller = await scrollerAt(page, id);
    expect(
      await scroller.evaluate((el) => el.scrollHeight <= el.clientHeight),
      "the column fits the room",
    ).toBe(true);
    expect(await fadeOf(scroller)).toEqual({ start: false, end: false, mask: "none" });
  });
}

test("a DetailLayout aside has no mask below lg, however tall", async ({ page }) => {
  const scroller = await scrollerAt(page, "page-layouts-detaillayout--sticky-aside-text", 390);
  expect(await fadeOf(scroller)).toEqual({ start: false, end: false, mask: "none" });
});

test("a SidebarLayout rail has no mask below md, however tall", async ({ page }) => {
  const scroller = await scrollerAt(page, "page-layouts-sidebarlayout--tall-rail", 390);
  expect(await fadeOf(scroller)).toEqual({ start: false, end: false, mask: "none" });
});

test("a scroller holding the tab stop drops its mask while focused from the keyboard, so the ring shows", async ({
  page,
}) => {
  const scroller = await scrollerAt(page, "page-layouts-detaillayout--sticky-aside-text");
  await expect(scroller).toHaveAttribute("tabindex", "0");
  await expect(scroller).toHaveAttribute("data-more-end", "");
  expect((await fadeOf(scroller)).mask).not.toBe("none");
  // Tab, not focus(): `:focus-visible` is what draws the ring.
  await scroller.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(scroller).toBeFocused();
  expect(await scroller.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  expect((await fadeOf(scroller)).mask).toBe("none");
});

/**
 * The rail shows where you are: once the layout has hydrated, a rail that scrolls puts its current
 * link in view (the rail's scroller moves, never the page), its scrollbar is the thin themed one,
 * and the folded disclosure below md names the current link.
 */
test("a SidebarLayout rail with its current link low in the list scrolls it into view, not the page", async ({
  page,
}) => {
  const scroller = await scrollerAt(page, "page-layouts-sidebarlayout--current-low");
  const current = scroller.locator("[aria-current]");
  await expect(current).toHaveText("Section 45");
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  const [box, at] = await Promise.all([
    boxOf(scroller, "scroller"),
    boxOf(current, "current link"),
  ]);
  expect(at.y, "the current link is below the scroller's top").toBeGreaterThanOrEqual(box.y);
  expect(at.y + at.height, "the current link is above the scroller's end").toBeLessThanOrEqual(
    box.y + box.height,
  );
  expect(await page.evaluate(() => window.scrollY), "the page did not move").toBe(0);
  // The fade follows the scroll: more above and below.
  await expect.poll(() => fadeOf(scroller).then((f) => [f.start, f.end])).toEqual([true, true]);
});

test("a SidebarLayout rail whose current link is at the top stays at the top", async ({ page }) => {
  const scroller = await scrollerAt(page, "page-layouts-sidebarlayout--tall-rail");
  await expect(scroller.locator("[aria-current]")).toHaveText("Section 1");
  expect(await scroller.evaluate((el) => el.scrollTop)).toBe(0);
});

const scrollbarOf = (el: Element) => ({
  width: getComputedStyle(el).scrollbarWidth,
  bar: getComputedStyle(el).scrollbarColor,
  scroller: getComputedStyle(el).color,
  // The rail's ink is the inner box's (text-slate-900), not the scrollbar's (text-slate-400).
  ink: getComputedStyle(el.firstElementChild ?? el).color,
  current: getComputedStyle(el.querySelector("[aria-current]") ?? el).color,
});

test("a SidebarLayout rail scrolls with the thin scrollbar and keeps the rail's ink", async ({
  page,
  browserName,
}) => {
  const scroller = await scrollerAt(page, "page-layouts-sidebarlayout--current-low");
  const got = await scroller.evaluate(scrollbarOf);
  // Headless Firefox reports `scrollbar-width: none` for every element (overlay scrollbars), as in
  // code-block.spec.ts, so the width is asserted in the other two engines only.
  if (browserName !== "firefox") expect(got.width).toBe("thin");
  expect(got.bar).toContain(got.scroller);
  expect(got.ink).not.toBe(got.scroller);
  expect(got.current).toBe(got.ink);
});

test("below md the folded rail's summary names the current link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: desktop.height });
  await page.goto(storyUrl("page-layouts-sidebarlayout--current-low"));
  const summary = page.getByRole("complementary").locator("summary");
  await expect(summary).toHaveText("All sections: Section 45");
});
