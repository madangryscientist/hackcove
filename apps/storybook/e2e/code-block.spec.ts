import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@slashsuite/themes-shared/files";

// The layout runs once, in the reference theme (the first theme file in sorted order); how each theme
// looks is the visual check's.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

/** Each story holds one long one-line command (or line of code) in a box at most 24rem wide. */
const wrapping = ["text-code--long-line", "text-code--copy", "text-code--long-token"];
const scrolling = ["text-code--scroll", "text-code--copy-scroll", "text-codeexample--long-code"];

const open = async (page: Page, id: string, theme: { id: string }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme.id}`);
  await code(page).waitFor();
};

/** The story's code: the one `<code>` in its figure. */
const code = (page: Page) => page.getByRole("figure").getByRole("code");

/**
 * Whether the end of the code's longest line shows: the last character's point on screen is the
 * code's own (not clipped by its box, nor off the side of the page, nor under the copy button).
 * Read as a reader's eye would find it, by hit testing that point.
 */
const lineEndShows = (target: Locator) =>
  target.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const [end] = [...range.getClientRects()].toSorted((a, b) => b.right - a.right);
    const hit = end && document.elementFromPoint(end.right - 2, end.top + end.height / 2);
    return !!hit && el.contains(hit);
  });

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
    test(`390px: ${id} does not clip the pre, and the page does not scroll sideways`, async ({
      page,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      // Nothing to scroll: the end of every line is laid out inside the box, on screen.
      expect(await lineEndShows(code(page))).toBe(true);
    });
  }

  for (const id of scrolling) {
    test(`390px: ${id} scrolls inside its box to the end of the line, and the page does not scroll sideways`, async ({
      page,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      // The line is longer than the box: its end is clipped rather than widening the figure.
      expect(await lineEndShows(code(page))).toBe(false);
      // A sideways wheel over the code scrolls it all the way along, to the line's end.
      await code(page).hover();
      await page.mouse.wheel(10_000, 0);
      await expect.poll(() => lineEndShows(code(page))).toBe(true);
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
    await code(page).waitFor();
    const selected = await code(page).evaluate((el) => {
      const selection = getSelection();
      selection?.selectAllChildren(el);
      return selection?.toString() ?? "";
    });
    expect(selected).toBe(source);
    // The DOM text is the source too: the words are boxed, never re-spelled (no non-breaking hyphen).
    expect(await code(page).evaluate((el) => el.textContent)).toBe(source);
  });
}

test("a real copy of the selected code puts the source text on the clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=text-code--long-line&viewMode=story");
  await code(page).evaluate((el) => getSelection()?.selectAllChildren(el));
  await page.keyboard.press("ControlOrMeta+c");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(sources["text-code--long-line"]);
});
