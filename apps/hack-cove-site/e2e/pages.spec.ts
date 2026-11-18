import { expect, test } from "@playwright/test";
import { shardPages } from "./shard";

/**
 * Pages whose h1 count is a known finding, each with the ticket that fixes it. The page stays in the
 * loop; only its h1 assert is left out.
 */
const knownH1: readonly { page: string; ticket: string }[] = [];

// Every page the site builds, on desktop and on a phone: it is served, it has exactly one h1, and
// nothing on it scrolls sideways (content off the side of a phone cannot be reached).
for (const path of shardPages()) {
  test(`${path}: served, one h1, nothing scrolls sideways`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    if (!knownH1.some((known) => known.page === path)) {
      await expect(page.locator("h1")).toHaveCount(1);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
