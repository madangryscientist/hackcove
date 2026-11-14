import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";
import { everyPage, setScheme } from "./scheme";

/** The header's 56px row and its 1px bottom border: the one phone header height. */
const PHONE_HEADER = 57;

const paths = [...new Set(everyPage)];

/**
 * One test per page, per scheme, never one test looping over the pages: each load then has its own
 * test budget (a slow page cannot spend the next page's), a failure names the page, and a new page
 * adds a test instead of lengthening an existing one. Each test sets the scheme on its own page, so
 * nothing is shared between tests.
 */
for (const scheme of ["dark", "light"] as const) {
  test.describe(`at 390px under ${scheme}`, () => {
    for (const path of paths) {
      test(`${path}: the section nav is behind the Menu button, every section reachable, no sideways scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 800 });
        await page.goto(path);
        await setScheme(page, scheme);
        const menu = page.getByRole("banner").locator("details");
        await expect(menu.locator("summary")).toHaveText("Menu");
        await expect(menu.getByRole("link").first()).toBeHidden();
        await menu.locator("summary").click();
        await expect(menu).toHaveJSProperty("open", true);
        const links = menu.getByRole("link");
        await expect(links, `${path}: the menu lists every section`).toHaveCount(
          site.sections.length,
        );
        for (const [index, { navLabel }] of site.sections.entries()) {
          await expect(links.nth(index)).toHaveText(navLabel);
          await expect(links.nth(index)).toBeInViewport({ ratio: 1 });
        }
        const { overflow, height } = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          height: document.querySelector("header")?.getBoundingClientRect().height ?? 0,
        }));
        expect(overflow, `${path}: sideways scroll`).toBeLessThanOrEqual(0);
        expect(height, `${path}: header height`).toBe(PHONE_HEADER);
      });
    }
  });
}
