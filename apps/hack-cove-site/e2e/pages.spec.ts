import { expect, test, type Page } from "@playwright/test";
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

const isKnownH1 = (path: string) => knownH1.some((known) => known.page === path);

/** Open `path`: it is served, and nothing on it scrolls sideways. */
async function servedWithoutSidewaysScroll(page: Page, path: string): Promise<void> {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

// Every page the site builds, on desktop and on a phone: it is served, it has exactly one h1, and
// nothing on it scrolls sideways (content off the side of a phone cannot be reached).
for (const path of sitePages.filter((known) => !isKnownH1(known))) {
  test(`${path}: served, one h1, nothing scrolls sideways`, async ({ page }) => {
    await servedWithoutSidewaysScroll(page, path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
}

// A page whose h1 count is a known finding still gets the rest.
for (const path of sitePages.filter(isKnownH1)) {
  test(`${path}: served, nothing scrolls sideways (h1 count is a known finding)`, async ({
    page,
  }) => {
    await servedWithoutSidewaysScroll(page, path);
  });
}
