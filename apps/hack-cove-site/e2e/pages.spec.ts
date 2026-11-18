import { expect, test } from "@playwright/test";
import { sitePages } from "../test/pages";

/**
 * Pages whose h1 count is a known finding, each with the ticket that fixes it. The page stays in the
 * loop; only its h1 assert is left out.
 */
// Live examples of PageTitle and Display render their own h1.
const knownH1: readonly { page: string; ticket: string }[] = [
  { page: "/ui/page-header/", ticket: "HC-499" },
  { page: "/ui/hero/", ticket: "HC-499" },
  { page: "/ui/card-grid/", ticket: "HC-499" },
  { page: "/ui/list-layout/", ticket: "HC-499" },
  { page: "/ui/detail-layout/", ticket: "HC-499" },
  { page: "/ui/form-layout/", ticket: "HC-499" },
  { page: "/ui/prose-layout/", ticket: "HC-499" },
  { page: "/ui/sidebar-layout/", ticket: "HC-499" },
  { page: "/ui/docs-layout/", ticket: "HC-499" },
  { page: "/ui/centered-layout/", ticket: "HC-499" },
  { page: "/ui/headings/", ticket: "HC-499" },
  { page: "/ui/callout/", ticket: "HC-499" },
  { page: "/ui/loading/", ticket: "HC-499" },
  { page: "/ui/status-pages/", ticket: "HC-499" },
];

// Every page the site builds, on desktop and on a phone: it is served, it has exactly one h1, and
// nothing on it scrolls sideways (content off the side of a phone cannot be reached).
for (const path of sitePages) {
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
