import { expect, test, type Page } from "@playwright/test";

/**
 * The no-jump check: on every Layout story, at every width, the page title starts at the same x
 * as the header's logo, and that x is the same on every Layout story (short page and long alike).
 * Stories are found by title in Storybook's own index, so a new `Layout/…` story is checked with
 * no edit here.
 */
const widths = [375, 768, 1280];

type IndexEntry = { id: string; title: string; type: string };

async function layoutStories(page: Page): Promise<string[]> {
  const response = await page.request.get("/index.json");
  const { entries }: { entries: Record<string, IndexEntry> } = await response.json();
  return Object.values(entries)
    .filter((entry) => entry.type === "story" && entry.title.startsWith("Layout/"))
    .map((entry) => entry.id)
    .toSorted();
}

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
