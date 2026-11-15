import { expect, test, type Page } from "@playwright/test";

// A `fill` Card takes its parent's height (a 400px box in the story) and only its body scrolls:
// a keyboard user tabbing to the last link scrolls the body, and the title stays in view.

test.use({ viewport: { width: 1280, height: 600 } });

/** Presses Tab until `name`'s link has focus, giving up after `max` presses. */
async function tabTo(page: Page, name: string, max = 40): Promise<void> {
  const link = page.getByRole("link", { name, exact: true });
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press("Tab");
    if (await link.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`Tab never reached the link "${name}"`);
}

const cases = [
  { story: "content-card--fill", title: "Shops nearby", last: "Bric-a-brac" },
  { story: "content-card--fill-plain", title: "Notes", last: "read the hours" },
];

for (const { story, title, last } of cases) {
  test(`${story}: tabbing to the last link scrolls the body and the title stays put`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=${story}&viewMode=story`);
    const card = page.getByRole("region", { name: title });
    await expect(card).toBeVisible();
    const link = card.getByRole("link", { name: last, exact: true });
    // Below the box's bottom edge before the body scrolls.
    await expect(link).not.toBeInViewport();
    await tabTo(page, last);
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    await expect(card.getByRole("heading", { name: title })).toBeInViewport();
  });
}
