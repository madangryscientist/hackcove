import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themeScope } from "@hackcove/themes-shared/scope";

// The layout runs once, in the reference theme (the first theme file in sorted order); how each theme
// looks is the visual check's.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

/** Each story holds one long one-line command (or line of code) in a box at most 24rem wide. */
const wrapping = ["text-code--long-line", "text-code--copy", "text-code--long-token"];
const scrolling = ["text-code--scroll", "text-code--copy-scroll", "text-codeexample--long-code"];

const open = async (page: Page, id: string, theme: { id: string; css: string }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme.id}`);
  await page.locator("figure").first().waitFor();
  // The story really is under the theme's own scope class.
  const scope = themeScope(theme.css);
  expect(scope).toBeDefined();
  expect(
    await page
      .locator("[data-theme]")
      .first()
      .evaluate((el) => [...el.classList]),
  ).toEqual([scope]);
};

/** Nothing the page shows is wider than the viewport, and the page itself does not scroll sideways. */
const pageDoesNotScrollSideways = (page: Page) =>
  page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

const theme = themes[0];
if (theme) {
  for (const id of wrapping) {
    test(`390px: ${id} wraps, so the pre does not clip and the page does not scroll sideways`, async ({
      page,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      // The pre has nothing to scroll: the text is laid out inside it.
      const overflow = await page
        .locator("figure pre")
        .evaluate((pre) => pre.scrollWidth - pre.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const id of scrolling) {
    test(`390px: ${id} scrolls inside its box to the end of the line, and the page does not scroll sideways`, async ({
      page,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      const scroller = page.locator("figure pre").locator("xpath=..");
      // The line is longer than the box: it scrolls rather than widening the figure.
      expect(await scroller.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0);
      // Scrolled to the end, it has scrolled all the way along.
      const gap = await scroller.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      });
      expect(gap).toBeLessThanOrEqual(1);
    });
  }
}

/** What each story holds, as the source gave it: the text a reader selects and copies. */
const sources = {
  "text-code--long-line":
    "bunx nx run-many -t typecheck lint test build --skip-nx-cache --output-style=stream",
  "text-code--long-token":
    "curl --fail --location https://registry.example.com/packages/hackcove-ui-react/archive/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.tgz",
};

for (const [id, source] of Object.entries(sources)) {
  test(`390px: selecting ${id} gives the source text, with no characters added`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page.locator("figure pre").waitFor();
    const selected = await page.locator("figure pre").evaluate((pre) => {
      const selection = getSelection();
      selection?.selectAllChildren(pre);
      return selection?.toString() ?? "";
    });
    expect(selected).toBe(source);
    // The DOM text is the source too: the words are boxed, never re-spelled (no non-breaking hyphen).
    expect(await page.locator("figure pre").evaluate((pre) => pre.textContent)).toBe(source);
  });
}

test("a real copy of the selected code puts the source text on the clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=text-code--long-line&viewMode=story");
  await page.locator("figure pre").evaluate((pre) => getSelection()?.selectAllChildren(pre));
  await page.keyboard.press("ControlOrMeta+c");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(sources["text-code--long-line"]);
});
