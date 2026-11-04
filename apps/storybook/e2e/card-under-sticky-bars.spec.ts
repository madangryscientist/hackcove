import { expect, test, type Locator, type Page } from "@playwright/test";

// A Card's own link, button and badge are lifted above its stretched link (`liftInteractive`), and
// the card is `isolate`, so they rank inside the card. AppShell's sticky header (z-10) and a
// StickyBar (z-5) therefore stay on top where a scrolled card runs under them. Asserted with
// elementFromPoint, the way a pointer reaches the page: the bar, not the card's control, is hit.

const story = "/iframe.html?id=content-card--under-sticky-bars&viewMode=story";

/** Scrolls the page so the centre of `target` sits `y` px below the top of the viewport. */
async function scrollTo(target: Locator, y: number): Promise<void> {
  await target.evaluate((el, offset) => {
    const { top, height } = el.getBoundingClientRect();
    window.scrollBy(0, top + height / 2 - offset);
  }, y);
}

/** Whether the element at the centre of `target` is `target` itself or inside it: what a click there reaches. */
async function isHit(target: Locator): Promise<boolean> {
  return target.evaluate((el) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    const hit = document.elementFromPoint(left + width / 2, top + height / 2);
    return hit !== null && el.contains(hit);
  });
}

/** Whether the element at the centre of `target` is `bar` or inside it: the bar is what a click there reaches. */
async function barIsHit(target: Locator, bar: Locator): Promise<boolean> {
  const point = await target.evaluate((el) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  });
  return bar.evaluate((node, p) => {
    const hit = document.elementFromPoint(p.x, p.y);
    return hit !== null && node.contains(hit);
  }, point);
}

const controls: { name: string; at: (page: Page) => Locator }[] = [
  { name: "link", at: (page) => page.getByRole("link", { name: "Open the build", exact: true }) },
  { name: "button", at: (page) => page.getByRole("button", { name: "Accept", exact: true }) },
  // The badge's own link: the stretched card link is named by the whole card, so it does not match.
  { name: "CardBadge", at: (page) => page.getByRole("link", { name: "Flaky", exact: true }) },
];

for (const { name, at } of controls) {
  test(`a Card's ${name} scrolled under AppShell's header: the header is hit`, async ({ page }) => {
    await page.goto(story);
    const control = at(page);
    await expect(control).toBeVisible();
    await scrollTo(control, 28);
    expect(await barIsHit(control, page.getByRole("banner"))).toBe(true);
  });

  test(`a Card's ${name} scrolled under a StickyBar: the StickyBar is hit`, async ({ page }) => {
    await page.goto(story);
    const control = at(page);
    const bar = page.getByTestId("sticky-bar");
    await expect(bar).toBeVisible();
    const box = await bar.boundingBox();
    if (!box) throw new Error("no StickyBar box");
    await scrollTo(control, box.y + box.height / 2);
    expect(await barIsHit(control, bar)).toBe(true);
  });
}

test("a Card's own link and button stay clickable, and the rest of the card follows the card link", async ({
  page,
}) => {
  await page.goto(story);
  const start = page.url();

  const button = page.getByRole("button", { name: "Accept", exact: true });
  expect(await isHit(button)).toBe(true);
  await button.click();
  expect(page.url()).toBe(start);

  // Card body text and link: click at their centre with the mouse, after checking the centre is theirs.
  // The page is reset to the top first, so the header does not cover them.
  const clickAt = async (target: Locator): Promise<void> => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const point = await target.evaluate((el) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      return { x: left + width / 2, y: top + height / 2 };
    });
    expect(await isHit(target), `point ${JSON.stringify(point)} is not the target`).toBe(true);
    await page.mouse.click(point.x, point.y);
  };

  // Plain body text is not interactive, so a click on it reaches the card's stretched link.
  await clickAt(page.locator("a.link-stretch"));
  await expect(page).toHaveURL(/#build-41$/);

  await page.goto(story);
  await clickAt(page.getByRole("link", { name: "Open the build", exact: true }));
  await expect(page).toHaveURL(/#open$/);
});

test("a calendar opened from a date field in a Card is a popover over the card below it", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=forms-datefield--calendar-in-card&viewMode=story");
  await page.getByRole("button", { name: /^Calendar/ }).click();
  await expect(page.getByRole("grid")).toBeVisible();

  const popover = page.getByRole("dialog").locator("xpath=..");
  const below = page.getByRole("region", { name: "Below" });
  const popBox = await popover.boundingBox();
  const belowBox = await below.boundingBox();
  if (!popBox || !belowBox) throw new Error("no popover or card box");
  const left = Math.max(popBox.x, belowBox.x);
  const right = Math.min(popBox.x + popBox.width, belowBox.x + belowBox.width);
  const top = Math.max(popBox.y, belowBox.y);
  const bottom = Math.min(popBox.y + popBox.height, belowBox.y + belowBox.height);
  // The popover must cover part of the card below, or the check proves nothing.
  expect(bottom).toBeGreaterThan(top);

  const point = [(left + right) / 2, (top + bottom) / 2] as const;
  expect(
    await popover.evaluate((node, [x, y]) => node.contains(document.elementFromPoint(x, y)), point),
  ).toBe(true);
});
