import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";
import { everyPage, setScheme, toggle } from "./scheme";

/** The header's 56px row and its 1px bottom border: the one phone header height. */
const PHONE_HEADER = 57;

for (const scheme of ["dark", "light"] as const) {
  test(`at 390px under ${scheme} the section nav is behind the Menu button on every page: every section reachable, no sideways scroll, one header height`, async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await setScheme(page, scheme);
    const heights: Record<string, number> = {};
    for (const path of new Set(everyPage)) {
      await page.goto(path);
      await toggle(page).waitFor();
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
      heights[path] = height;
    }
    expect(new Set(Object.values(heights)), JSON.stringify(heights)).toEqual(
      new Set([PHONE_HEADER]),
    );
  });
}
