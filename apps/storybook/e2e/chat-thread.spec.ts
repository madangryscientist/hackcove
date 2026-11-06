import { expect, test, type Locator, type Page } from "@playwright/test";

const STORY =
  "/iframe.html?id=content-chatthread--add-message&viewMode=story&globals=theme:default";

/** Two frames: a ResizeObserver reports after layout, and a scroll event fires before the next paint. */
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );

const thread = (page: Page) => page.getByRole("region", { name: "Growing chat" });
const distanceFromBottom = (box: Locator) =>
  box.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);

/** Scrolls the box and waits until its scroll handler has seen it. */
async function scrollBox(page: Page, box: Locator, top: number | "bottom") {
  await box.evaluate((el, to) => {
    el.scrollTop = to === "bottom" ? el.scrollHeight : to;
  }, top);
  await settle(page);
}

/** Adds a message and waits until it is in the DOM and any follow has run. */
async function addMessage(page: Page, count: number) {
  await page.getByRole("button", { name: "Add message" }).click();
  await expect(page.getByText(`${count} messages`)).toBeAttached();
  await settle(page);
}

test("a ChatThread sticks to the bottom until the reader scrolls up, and again once they scroll back", async ({
  page,
}) => {
  await page.goto(STORY);
  const box = thread(page);
  await expect(box).toBeVisible();
  await settle(page);
  expect(await box.evaluate((el) => el.scrollHeight > el.clientHeight), "the box overflows").toBe(
    true,
  );

  // It starts at the bottom, and a new message keeps it there.
  expect(await distanceFromBottom(box)).toBeLessThanOrEqual(1);
  const before = await box.evaluate((el) => el.scrollTop);
  await addMessage(page, 21);
  expect(await distanceFromBottom(box)).toBeLessThanOrEqual(1);
  expect(await box.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);

  // Scrolled up, a new message leaves the reader exactly where they were.
  await scrollBox(page, box, 100);
  await addMessage(page, 22);
  expect(await box.evaluate((el) => el.scrollTop)).toBe(100);
  expect(await distanceFromBottom(box)).toBeGreaterThan(32);

  // Scrolled back down, it follows again.
  await scrollBox(page, box, "bottom");
  await addMessage(page, 23);
  expect(await distanceFromBottom(box)).toBeLessThanOrEqual(1);
});
