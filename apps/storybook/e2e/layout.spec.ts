import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The no-jump check: on every page story, at every width, the page title starts at the same x
 * as the header's logo, and that x is the same on every page story (short page and long alike).
 * Stories are found by title in Storybook's own index, so a new `Page layouts/…` story is checked with
 * no edit here.
 *
 * One test per story per width, never one test looping over the stories: each page load then has
 * its own test budget, so a slow engine under load cannot spend the next story's time, and a new
 * story adds a test instead of lengthening an existing one. The list comes from the built
 * `storybook-static/index.json` as the spec is collected (the `e2e` Nx target builds Storybook
 * first); per width, one `beforeAll` measures the first story's logo x and every story's test
 * asserts its title x against both its own logo and that reference.
 *
 * The compact Do/Dont fragments the docs pages render are left out too.
 *
 * Three layouts are left out of that check and asserted on their own terms further down:
 * `CenteredLayout` is a narrow centred card on purpose (the one exception to the shared left edge),
 * `SidebarLayout` puts a rail left of its canvas and `FullBleedLayout` has no page title or padding.
 */
const widths = [375, 768, 1280];

const ownTerms = new Set([
  "Page layouts/CenteredLayout",
  "Page layouts/SidebarLayout",
  "Page layouts/FullBleedLayout",
]);

type IndexEntry = { id: string; title: string; name: string; type: string; importPath: string };

/** The full-page stories: every `Page layouts/…` story, and the AppShell's own. */
const isPageStory = (entry: IndexEntry) =>
  (entry.title.startsWith("Page layouts/") &&
    // List → Detail → Form is three pages in one story, so it has three titles.
    !entry.importPath.endsWith("/Pages.stories.tsx")) ||
  (entry.title === "Layout/AppShell" && !entry.importPath.endsWith("/AppShellDocs.stories.tsx"));

/** The docs' compact `Do …` / `Dont …` fragments are not pages: they have no title or header to align. */
const isDocsFragment = (entry: IndexEntry) => /^Do(nt)? /.test(entry.name);

/** The build the e2e serves: `STATIC_DIR`, as `serve.ts` takes it, or `storybook-static`. */
const staticDir = process.env["STATIC_DIR"] ?? join(import.meta.dirname, "..", "storybook-static");

/**
 * The page stories, read from the build's index as this spec is collected. A missing index fails
 * collection naming the command that writes it, never a run that quietly checks nothing.
 */
function layoutStoryIds(): string[] {
  const path = join(staticDir, "index.json");
  if (!existsSync(path))
    throw new Error(
      `${path} is missing: run \`bunx nx e2e storybook\`, which builds Storybook first`,
    );
  const { entries }: { entries: Record<string, IndexEntry> } = JSON.parse(
    readFileSync(path, "utf8"),
  );
  return Object.values(entries)
    .filter(
      (entry) =>
        entry.type === "story" &&
        isPageStory(entry) &&
        !ownTerms.has(entry.title) &&
        !isDocsFragment(entry),
    )
    .map((entry) => entry.id)
    .toSorted();
}

const boxOf = async (locator: Locator, what: string) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${what} has no box`);
  return box;
};

const left = async (box: Promise<{ x: number } | null>) => (await box)?.x;

async function edges(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:default`);
  const title = page.getByRole("heading", { level: 1 });
  const logo = page.getByRole("banner").getByRole("link").first();
  await title.waitFor();
  return { title: await left(title.boundingBox()), logo: await left(logo.boundingBox()) };
}

const storyIds = layoutStoryIds();
// The story every other one is measured against at each width.
const [reference] = storyIds;
if (reference === undefined)
  throw new Error(
    `${join(staticDir, "index.json")} has no page stories: the build has no \`Page layouts/…\` story`,
  );

for (const width of widths) {
  test.describe(`at ${width}px`, () => {
    let referenceX: number | undefined;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.setViewportSize({ width, height: 800 });
      referenceX = (await edges(page, reference)).logo;
      await page.close();
    });

    for (const id of storyIds) {
      test(`${id}: the title starts at the logo's x`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        const { title, logo } = await edges(page, id);
        expect(title, `${id}: title x vs logo x`).toBe(logo);
        expect(title, `${id}: title x vs ${reference}'s logo x`).toBe(referenceX);
      });
    }
  });
}

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

test("from md an overflowing subnav fades the side with more to scroll, and a fitting row does not", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 800 });
  await page.goto(storyUrl("layout-appshell--overflowing-subnav"));
  const subnav = page
    .getByRole("banner")
    .locator("div:has(> nav[aria-label='Personal'])")
    // The phone menu holds the same nav earlier in the DOM; the row is the last.
    .last();
  await subnav.waitFor();
  const state = () =>
    subnav.evaluate((el) => ({
      start: el.hasAttribute("data-more-start"),
      end: el.hasAttribute("data-more-end"),
      mask: getComputedStyle(el).maskImage,
    }));

  await expect.poll(state).toMatchObject({ start: false, end: true });
  expect((await state()).mask).toContain("linear-gradient");

  // Tabbing to the last link scrolls it into view: the end fade goes, the start one arrives.
  await subnav.getByRole("link", { name: "Settings" }).focus();
  await expect.poll(state).toMatchObject({ start: true, end: false });
  expect((await state()).mask).toContain("linear-gradient");

  // Wide enough that the row fits: no cue, no mask.
  await page.setViewportSize({ width: 1600, height: 800 });
  await expect.poll(state).toEqual({ start: false, end: false, mask: "none" });
});

test("at 1280px a full-width Select in controls sizes to its content and leaves the toggle square", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(storyUrl("layout-appshell--header-slots"));
  const toggle = page.getByRole("button", { name: /^Switch to / });
  await toggle.waitFor();
  const toggleBox = await boxOf(toggle, "toggle");
  expect(toggleBox.width).toBeGreaterThanOrEqual(30);
  expect(Math.abs(toggleBox.width - toggleBox.height)).toBeLessThanOrEqual(1);
});

for (const width of widths) {
  test(`at ${width}px the form's column starts at the title's x, as the list's rows do`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("page-layouts-formlayout--new-quote"));
    const title = await left(page.getByRole("heading", { level: 1 }).boundingBox());
    expect(await left(page.locator("form").boundingBox())).toBe(title);
    await page.goto(storyUrl("page-layouts-listlayout--with-rows"));
    expect(await left(page.getByRole("article").first().boundingBox())).toBe(title);
  });
}

for (const width of widths) {
  test(`at ${width}px SidebarLayout shares the header's grid; the rail stacks under md`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("page-layouts-sidebarlayout--orgs"));
    const rail = page.getByRole("complementary");
    const title = page.getByRole("heading", { level: 1 });
    await title.waitFor();
    const railBox = await boxOf(rail, "rail");
    const titleBox = await boxOf(title, "title");
    const logoBox = await boxOf(page.locator("header a").first(), "logo");
    const { contentRight, railFill } = await page.evaluate(() => {
      const container = document.querySelector("main > div");
      const style = container ? getComputedStyle(container) : null;
      const aside = document.querySelector("aside");
      const asideStyle = aside ? getComputedStyle(aside) : null;
      return {
        contentRight: container
          ? container.getBoundingClientRect().right - parseFloat(style?.paddingRight ?? "0")
          : -1,
        railFill: asideStyle?.backgroundColor ?? "",
      };
    });
    // The rail is a list on the page background, at the header logo's x: no slab, no own edge.
    expect(railBox.x).toBe(logoBox.x);
    expect(railFill).toBe("rgba(0, 0, 0, 0)");
    const canvasRight = await page.evaluate(() => {
      const canvas = document.querySelector("aside + div");
      return canvas ? canvas.getBoundingClientRect().right : -1;
    });
    expect(canvasRight).toBe(contentRight);
    if (width < 768) {
      expect(railBox.width).toBe(contentRight - logoBox.x);
      expect(railBox.y + railBox.height).toBeLessThanOrEqual(titleBox.y);
      expect(titleBox.x).toBe(logoBox.x);
    } else {
      expect(railBox.width).toBe(224);
      expect(titleBox.x).toBeGreaterThan(railBox.x + railBox.width);
    }
  });

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
      expect((await boxOf(title, "title")).y).toBeLessThan(200);
      await summary.click();
      await expect(nav).toBeVisible();
    } else {
      await expect(summary).toBeHidden();
      await expect(nav).toBeVisible();
    }
  });

  test(`at ${width}px FullBleedLayout's canvas fills the width and its panel stacks under lg`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("page-layouts-fullbleedlayout--with-panel"));
    const panel = page.getByRole("complementary");
    await panel.waitFor();
    const canvas = page.locator("main > div > div").first();
    const [panelBox, canvasBox] = [await boxOf(panel, "panel"), await boxOf(canvas, "canvas")];
    expect(canvasBox.x).toBe(0);
    if (width < 1024) {
      expect(canvasBox.width).toBe(width);
      expect(panelBox.y).toBeGreaterThanOrEqual(canvasBox.y + canvasBox.height);
    } else {
      expect(panelBox.width).toBe(288);
      expect(canvasBox.width).toBe(width - 288);
      expect(panelBox.x).toBe(canvasBox.width);
    }
  });

  test(`at ${width}px CenteredLayout's card is max-w-md, centred, and sits at the same y on every story`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const tops: Array<number | undefined> = [];
    for (const id of [
      "page-layouts-centeredlayout--sign-in",
      "page-layouts-centeredlayout--not-found",
    ]) {
      await page.goto(storyUrl(id));
      const title = page.getByRole("heading", { level: 1 });
      await title.waitFor();
      const card = title.locator("xpath=ancestor::div[contains(@class,'rounded-xl')]");
      const box = await card.boundingBox();
      const cardX = box?.x ?? 0;
      const w = box?.width ?? 0;
      expect(w).toBeLessThanOrEqual(448);
      if (width >= 768) expect(w).toBe(448);
      expect(cardX).toBeGreaterThan(0);
      expect(cardX + w / 2).toBeCloseTo(width / 2, 0);
      tops.push(box?.y);
    }
    expect(new Set(tops).size).toBe(1);
  });
}
