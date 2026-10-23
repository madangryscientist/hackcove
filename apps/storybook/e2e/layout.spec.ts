import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The no-jump check: on every Layout story, at every width, the page title starts at the same x
 * as the header's logo, and that x is the same on every Layout story (short page and long alike).
 * Stories are found by title in Storybook's own index, so a new `Layout/…` story is checked with
 * no edit here.
 *
 * Three layouts are left out of that check and asserted on their own terms further down:
 * `CenteredLayout` is a narrow centred card on purpose (the one exception to the shared left edge),
 * `SidebarLayout` puts a rail left of its canvas and `FullBleedLayout` has no page title or padding.
 */
const widths = [375, 768, 1280];

const ownTerms = new Set([
  "Layout/CenteredLayout",
  "Layout/SidebarLayout",
  "Layout/FullBleedLayout",
]);

type IndexEntry = { id: string; title: string; type: string };

async function layoutStories(page: Page): Promise<string[]> {
  const response = await page.request.get("/index.json");
  const { entries }: { entries: Record<string, IndexEntry> } = await response.json();
  return Object.values(entries)
    .filter(
      (entry) =>
        entry.type === "story" && entry.title.startsWith("Layout/") && !ownTerms.has(entry.title),
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

for (const width of widths) {
  test(`at ${width}px every Layout story's title starts at the logo's x, the same x on every story`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const seen: Record<string, number | undefined> = {};
    for (const id of await layoutStories(page)) {
      const { title, logo } = await edges(page, id);
      expect(title, `${id}: title x vs logo x`).toBe(logo);
      seen[id] = title;
    }
    expect(new Set(Object.values(seen)).size, JSON.stringify(seen)).toBe(1);
  });
}

test("at 375px the header stays one 56px row: a long nav scrolls and does not wrap", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  // The long page: its seven-item nav is wider than a phone.
  await page.goto(
    "/iframe.html?id=layout-appshell--long-page&viewMode=story&globals=theme:default",
  );
  const row = page.getByRole("banner").locator("div:has(> a[aria-label='Hack Cove'])");
  await row.waitFor();
  const { height, scrollWidth, clientWidth, navHeight } = await row.evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    navHeight: el.querySelector("nav")?.getBoundingClientRect().height ?? 0,
  }));
  expect(height).toBe(56);
  expect(scrollWidth).toBeGreaterThan(clientWidth);
  // One row of tabs: a wrapped nav would be at least two tabs tall.
  expect(navHeight).toBeGreaterThan(0);
  expect(navHeight).toBeLessThan(56);
});

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

for (const width of widths) {
  test(`at ${width}px the form's column starts at the title's x, as the list's rows do`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-formlayout--new-quote"));
    const title = await left(page.getByRole("heading", { level: 1 }).boundingBox());
    expect(await left(page.locator("form").boundingBox())).toBe(title);
    await page.goto(storyUrl("layout-listlayout--with-rows"));
    expect(await left(page.getByRole("article").first().boundingBox())).toBe(title);
  });
}

for (const width of widths) {
  test(`at ${width}px SidebarLayout fills the viewport; the rail stacks under md; the canvas keeps the Container's padding`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-sidebarlayout--orgs"));
    const rail = page.getByRole("complementary");
    const title = page.getByRole("heading", { level: 1 });
    await title.waitFor();
    const railBox = await boxOf(rail, "rail");
    const titleBox = await boxOf(title, "title");
    const { root, padding } = await page.evaluate(() => {
      const logo = document.querySelector("header a");
      const row = logo?.parentElement;
      const box = document.querySelector("main > div")?.getBoundingClientRect();
      return {
        root: { bottom: box?.bottom ?? 0 },
        padding: row ? parseFloat(getComputedStyle(row).paddingLeft) : -1,
      };
    });
    // No header height is written down: the layout is whatever the shell's column leaves.
    expect(root.bottom).toBe(800);
    if (width < 768) {
      expect(railBox.width).toBe(width);
      expect(railBox.y + railBox.height).toBeLessThanOrEqual(titleBox.y);
      expect(titleBox.x).toBe(padding);
    } else {
      expect(railBox.width).toBe(240);
      expect(railBox.y + railBox.height).toBe(800);
      expect(titleBox.x).toBe(240 + padding);
    }
  });

  test(`at ${width}px FullBleedLayout's canvas fills the width and its panel stacks under lg`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-fullbleedlayout--with-panel"));
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
    for (const id of ["layout-centeredlayout--sign-in", "layout-centeredlayout--not-found"]) {
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
