import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

/** Two frames: the observers that decide a tab stop report after layout. */
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );

const rail = (page: Page) => page.getByRole("complementary", { name: "All sections" });
const aside = (page: Page) => page.getByRole("complementary", { name: "Quote notes" });
/** The folded column: the rail's native `<details>`, a group. */
const column = (page: Page) => rail(page).getByRole("group");
/** The aside's scroller while it holds a tab stop: a group named as the aside is. */
const asideStop = (page: Page) => aside(page).getByRole("group", { name: "Quote notes" });

test.describe("a SidebarLayout with railLabel opens its folded column for real", () => {
  test("at 1280x720 the <details> is open and the rail's links are visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    await expect(column(page)).toHaveJSProperty("open", true);
    await expect(rail(page).getByRole("link", { name: "Section 1", exact: true })).toBeVisible();
  });

  test("at 400 wide it is closed and the summary shows", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    await expect(column(page)).toHaveJSProperty("open", false);
    await expect(rail(page).getByText("All sections")).toBeVisible();
    await expect(rail(page).getByRole("link").first()).toBeHidden();
  });

  test("resizing across md follows, both ways", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    await expect(column(page)).toHaveJSProperty("open", false);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(column(page)).toHaveJSProperty("open", true);
    await expect(rail(page).getByRole("link", { name: "Section 1", exact: true })).toBeVisible();
    await page.setViewportSize({ width: 400, height: 800 });
    await expect(column(page)).toHaveJSProperty("open", false);
    await expect(rail(page).getByText("All sections")).toBeVisible();
  });
});

test("a sticky rail of links that overflows has no tab stop of its own", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(storyUrl("page-layouts-sidebarlayout--tall-rail"));
  const sections = rail(page).getByRole("navigation", { name: "Sections" });
  await expect(sections.getByRole("link", { name: "Section 1", exact: true })).toBeInViewport();
  // The rail overflows: its last link is below the room it has.
  await expect(
    sections.getByRole("link", { name: "Section 60", exact: true }),
  ).not.toBeInViewport();
  await settle(page);
  // Tab from the header's last link goes straight to the rail's first link: no stop in between.
  await page.getByRole("banner").getByRole("link", { name: "Settings" }).focus();
  await page.keyboard.press("Tab");
  await expect(sections.getByRole("link", { name: "Section 1", exact: true })).toBeFocused();
  // And nothing in the rail is a named scroll stop.
  await expect(rail(page).getByRole("group", { name: "All sections" })).toHaveCount(0);
});

test.describe("a sticky DetailLayout aside of plain text", () => {
  test("takes a named tab stop when it overflows, and keyboard focus scrolls it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    const scroller = asideStop(page);
    await expect(scroller).toHaveAttribute("tabindex", "0");
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    // The stop is reached with Tab, not only with a script's focus(): it is the next stop after
    // Edit, since the record's blocks between them hold nothing the keyboard reaches.
    await page.getByRole("button", { name: "Edit" }).focus();
    await page.keyboard.press("Tab");
    await expect(scroller).toBeFocused();
    const before = await scroller.evaluate((el) => el.scrollTop);
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
  });

  test("takes none when it fits, and again when it stops fitting", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 2400 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    // It fits: its last note is on screen with the rest of the aside.
    await expect(aside(page).getByText(/^Note 18:/)).toBeInViewport({ ratio: 1 });
    await settle(page);
    await expect(asideStop(page)).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(asideStop(page)).toHaveAttribute("tabindex", "0");
    await page.setViewportSize({ width: 1280, height: 2400 });
    await expect(asideStop(page)).toHaveCount(0);
  });

  test("below lg nothing scrolls, so nothing takes a stop", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 720 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    await expect(aside(page)).toBeVisible();
    await settle(page);
    await expect(asideStop(page)).toHaveCount(0);
  });
});
