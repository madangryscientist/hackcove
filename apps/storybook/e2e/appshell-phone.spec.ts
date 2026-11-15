import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * AppShell on a phone (390px), in every theme: the nav and the subnav are behind one Menu button,
 * every link in them is reachable, the page never scrolls sideways, and the header is the same
 * height on every page, open or closed. Themes are found the way theme.spec.ts finds them, so a new
 * theme is checked with no edit here.
 *
 * One test per story per theme, never one test looping over the stories: each story then has its
 * own test budget (one slow story cannot spend the next one's), a failure names the story and the
 * theme, and a new theme adds tests instead of lengthening an existing one.
 */
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const WIDTH = 390;
/** The header's 56px row and its 1px bottom border. */
const HEADER_HEIGHT = 57;

/** Each story, with how many links its nav (7) and subnav hold: the menu must list them all. */
const stories = [
  { id: "layout-appshell--long-page", links: 7 + 6 },
  { id: "layout-appshell--short-page", links: 7 },
  { id: "layout-appshell--overflowing-subnav", links: 7 + 12 },
  { id: "layout-appshell--phone-menu", links: 7 + 6 },
  { id: "layout-appshell--header-slots", links: 7 },
  // Its menuControls sit above the nav in the menu; the links are the nav's.
  { id: "layout-appshell--menu-controls", links: 7 },
  // Its controls overflow the row; the Menu stays on screen beside them.
  { id: "layout-appshell--crowded-controls", links: 7 },
];

const open = async (page: Page, id: string, theme: string) => {
  await page.setViewportSize({ width: WIDTH, height: 700 });
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  const menu = page.getByRole("banner").locator("details");
  await menu.waitFor();
  return menu;
};

const headerHeight = async (page: Page) => {
  const box = await page.getByRole("banner").boundingBox();
  if (!box) throw new Error("the header has no box");
  return box.height;
};

const noSidewaysScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** A link a finger can reach: scrolled into view, inside the viewport, and nothing covering it. */
async function reachable(link: Locator): Promise<boolean> {
  await link.scrollIntoViewIfNeeded();
  return link.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return (
      box.width > 0 &&
      box.x >= 0 &&
      box.right <= document.documentElement.clientWidth &&
      box.y >= 0 &&
      box.bottom <= window.innerHeight &&
      !!hit &&
      el.contains(hit)
    );
  });
}

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test.describe(`theme ${theme}`, () => {
    for (const { id, links } of stories) {
      test(`at ${WIDTH}px ${id}: every link is behind the Menu button, none scrolls sideways, one header height`, async ({
        page,
      }) => {
        const menu = await open(page, id, theme);
        const button = menu.getByText("Menu", { exact: true });

        // Closed: the header is one row, the links are not on screen, and nothing scrolls sideways.
        await expect(menu.getByRole("link").first()).toBeHidden();
        expect(await noSidewaysScroll(page), `${id}: sideways scroll, closed`).toBeLessThanOrEqual(
          0,
        );
        expect(await headerHeight(page), `${id}: header height, closed`).toBe(HEADER_HEIGHT);

        // Open: every nav and subnav link is there and can be reached.
        await button.click();
        await expect(menu).toHaveJSProperty("open", true);
        const all = menu.getByRole("link");
        await expect(all).toHaveCount(links);
        for (const link of await all.all()) {
          expect(await reachable(link), `${id}: ${await link.textContent()} is not reachable`).toBe(
            true,
          );
        }
        expect(await noSidewaysScroll(page), `${id}: sideways scroll, open`).toBeLessThanOrEqual(0);
        expect(await headerHeight(page), `${id}: header height, open`).toBe(HEADER_HEIGHT);
      });
    }
  });
}

test("the Menu button works from the keyboard: Enter and Space open it, Tab enters the links, Escape closes it and returns to the button", async ({
  page,
}) => {
  const menu = await open(page, "layout-appshell--long-page", "default");
  const button = menu.locator("summary");

  await button.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveJSProperty("open", true);
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveJSProperty("open", false);
  await expect(button).toBeFocused();

  await page.keyboard.press("Space");
  await expect(menu).toHaveJSProperty("open", true);
  // Tab through every link: each is focusable, in the order nav then subnav.
  const names: string[] = [];
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press("Tab");
    names.push(await page.evaluate(() => document.activeElement?.textContent ?? ""));
  }
  expect(names[0]).toBe("Overview");
  expect(names.at(-1)).toBe("Audit");
});

test("the button is a disclosure that reports whether it is open, and following a link closes it", async ({
  page,
}) => {
  const menu = await open(page, "layout-appshell--long-page", "default");
  await expect(menu.locator("summary")).toHaveText("Menu");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Builds" }).click();
  await expect(menu).toHaveJSProperty("open", false);
});

test("from md there is no Menu button and the nav and subnav are rows", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  await page.goto(
    "/iframe.html?id=layout-appshell--long-page&viewMode=story&globals=theme:default",
  );
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Builds" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Branches" })).toBeVisible();
  await expect(header.locator("summary")).toBeHidden();
  expect(await headerHeight(page)).toBe(105);
});

/** The Menu button sits wholly inside the viewport's width. */
async function inViewport(page: Page, button: Locator): Promise<boolean> {
  const box = await button.boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  return !!box && box.width > 0 && box.x >= 0 && box.x + box.width <= width;
}

test(`at ${WIDTH}px menuControls are at the top of the Menu, each operable, with the nav after them`, async ({
  page,
}) => {
  const menu = await open(page, "layout-appshell--menu-controls", "default");
  const button = menu.locator("summary");
  expect(await inViewport(page, button), "the Menu button is off screen").toBe(true);

  const project = page.getByLabel("Project");
  const environment = page.getByLabel("Environment");
  const signOut = page.getByRole("button", { name: "Sign out" });
  await expect(project).toBeHidden();

  await button.click();
  await expect(menu).toHaveJSProperty("open", true);
  for (const control of [project, environment, signOut]) {
    await expect(control).toBeVisible();
    expect(await reachable(control)).toBe(true);
  }
  await project.selectOption("api");
  await expect(project).toHaveValue("api");
  await environment.selectOption("staging");
  await expect(environment).toHaveValue("staging");
  await expect(signOut).toBeEnabled();
  await signOut.click();

  // The nav's links come after the controls, in the same panel.
  const first = menu.getByRole("link").first();
  await expect(first).toBeVisible();
  expect(
    await signOut.evaluate(
      (el, link) => !!(el.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
      await first.elementHandle(),
    ),
  ).toBe(true);
  expect(await noSidewaysScroll(page)).toBeLessThanOrEqual(0);
  expect(await headerHeight(page)).toBe(HEADER_HEIGHT);
});

test("at 1280px menuControls sit in the header row after controls, once each, with no Menu button", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto(
    "/iframe.html?id=layout-appshell--menu-controls&viewMode=story&globals=theme:default",
  );
  const header = page.getByRole("banner");
  await expect(header.locator("summary")).toBeHidden();
  const toggle = header.getByRole("button").first();
  const toggleBox = await toggle.boundingBox();
  if (!toggleBox) throw new Error("the controls have no box");

  const project = page.getByLabel("Project");
  const environment = page.getByLabel("Environment");
  const signOut = page.getByRole("button", { name: "Sign out" });
  await expect(project).toHaveCount(1);
  await expect(environment).toHaveCount(1);
  await expect(signOut).toHaveCount(1);
  const row = toggleBox.y + toggleBox.height / 2;
  for (const control of [project, environment, signOut]) {
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    if (!box) throw new Error("a menu control has no box");
    expect(box.x, "after controls").toBeGreaterThanOrEqual(toggleBox.x + toggleBox.width);
    expect(Math.abs(box.y + box.height / 2 - row), "centred in the row").toBeLessThanOrEqual(1);
  }
  // Reachable for assistive tech too, not only painted.
  await expect(header.getByRole("combobox", { name: "Project" })).toBeVisible();
  await project.selectOption("api");
  await expect(project).toHaveValue("api");
  expect(await headerHeight(page)).toBe(HEADER_HEIGHT);
});

test(`at ${WIDTH}px controls that overflow the row clip, and the Menu button stays on screen and opens the nav`, async ({
  page,
}) => {
  const menu = await open(page, "layout-appshell--crowded-controls", "default");
  const button = menu.locator("summary");
  expect(await inViewport(page, button), "the Menu button is off screen").toBe(true);
  await button.click();
  await expect(menu).toHaveJSProperty("open", true);
  for (const link of await menu.getByRole("link").all()) {
    expect(await reachable(link), `${await link.textContent()} is not reachable`).toBe(true);
  }
  expect(await noSidewaysScroll(page)).toBeLessThanOrEqual(0);
});
