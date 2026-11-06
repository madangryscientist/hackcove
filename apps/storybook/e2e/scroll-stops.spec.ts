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

test.describe("a SidebarLayout with railLabel opens its folded column for real", () => {
  test("at 1280x720 the <details> is open and the rail's links are visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    const column = rail(page).locator("details");
    await expect(column).toHaveJSProperty("open", true);
    await expect(rail(page).getByRole("link", { name: "Section 1", exact: true })).toBeVisible();
  });

  test("at 400 wide it is closed and the summary shows", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    const column = rail(page).locator("details");
    await expect(column).toHaveJSProperty("open", false);
    await expect(rail(page).getByText("All sections")).toBeVisible();
    await expect(rail(page).getByRole("link").first()).toBeHidden();
  });

  test("resizing across md follows, both ways", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--long-rail"));
    const column = rail(page).locator("details");
    await expect(column).toHaveJSProperty("open", false);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(column).toHaveJSProperty("open", true);
    await expect(rail(page).getByRole("link", { name: "Section 1", exact: true })).toBeVisible();
    await page.setViewportSize({ width: 400, height: 800 });
    await expect(column).toHaveJSProperty("open", false);
    await expect(rail(page).getByText("All sections")).toBeVisible();
  });
});

test("a sticky rail of links that overflows has no tab stop of its own", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(storyUrl("page-layouts-sidebarlayout--tall-rail"));
  const scroller = page.getByRole("complementary", { name: "All sections" }).locator("> div");
  await expect(scroller).toBeVisible();
  expect(
    await scroller.evaluate((el) => el.scrollHeight > el.clientHeight),
    "the rail overflows",
  ).toBe(true);
  await settle(page);
  await expect(scroller).not.toHaveAttribute("tabindex", /.*/);
  await expect(scroller).not.toHaveAttribute("role", /.*/);
});

test.describe("a sticky DetailLayout aside of plain text", () => {
  test("takes a named tab stop when it overflows, and keyboard focus scrolls it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    const scroller = aside(page).locator("> div");
    await expect(scroller).toHaveAttribute("tabindex", "0");
    await expect(scroller).toHaveAttribute("role", "group");
    await expect(scroller).toHaveAttribute("aria-label", "Quote notes");
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    // The stop is reached with Tab, not only with a script's focus().
    await page.getByRole("button", { name: "Edit" }).focus();
    for (
      let i = 0;
      i < 10 && !(await scroller.evaluate((el) => el === document.activeElement));
      i++
    )
      await page.keyboard.press("Tab");
    await expect(scroller).toBeFocused();
    const before = await scroller.evaluate((el) => el.scrollTop);
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
  });

  test("takes none when it fits, and again when it stops fitting", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 2400 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    const scroller = aside(page).locator("> div");
    await expect(scroller).toBeVisible();
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(false);
    await settle(page);
    await expect(scroller).not.toHaveAttribute("tabindex", /.*/);
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(scroller).toHaveAttribute("tabindex", "0");
    await page.setViewportSize({ width: 1280, height: 2400 });
    await expect(scroller).not.toHaveAttribute("tabindex", /.*/);
  });

  test("below lg nothing scrolls, so nothing takes a stop", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 720 });
    await page.goto(storyUrl("page-layouts-detaillayout--sticky-aside-text"));
    const scroller = aside(page).locator("> div");
    await expect(scroller).toBeVisible();
    await settle(page);
    await expect(scroller).not.toHaveAttribute("tabindex", /.*/);
  });
});
