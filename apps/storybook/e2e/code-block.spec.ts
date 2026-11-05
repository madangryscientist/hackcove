import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themeScope } from "@hackcove/themes-shared/scope";

// Same source of truth as the toolbar switcher and theme.spec.ts: one theme per CSS file under themes/*/.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const COMMAND = "bunx playwright test --project=chromium --reporter=list --output=out";

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

for (const theme of themes) {
  for (const id of wrapping) {
    test(`390px, ${theme.id}: ${id} wraps, so no part of the line is clipped and the page does not scroll sideways`, async ({
      page,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      const fit = await page.locator("figure pre").evaluate((pre) => {
        const figure = pre.closest("figure");
        if (!figure) throw new Error("no figure");
        const range = document.createRange();
        range.selectNodeContents(pre);
        const box = figure.getBoundingClientRect();
        const rects = [...range.getClientRects()];
        return {
          // The pre has nothing to scroll: the text is laid out inside it.
          overflow: pre.scrollWidth - pre.clientWidth,
          // Every line box of the text ends inside the figure's border box.
          rightmost: Math.max(...rects.map((rect) => rect.right)) - box.right,
          lines: new Set(rects.map((rect) => Math.round(rect.top))).size,
        };
      });
      expect(fit.overflow).toBeLessThanOrEqual(0);
      expect(fit.rightmost).toBeLessThanOrEqual(0.5);
      // At 390px the command has to take more than one line to fit; that is the wrap under test.
      expect(fit.lines).toBeGreaterThan(1);
    });
  }

  test(`390px, ${theme.id}: wrapping breaks at spaces only, so a hyphenated flag stays on one line at every box width`, async ({
    page,
  }) => {
    await open(page, "text-code--long-line", theme);
    // Where a line ends depends on the font, so the box is narrowed one step at a time: some
    // width puts a hyphen right at a line end, and a flag must still not be split there.
    const split = await page.locator("figure pre").evaluate((pre) => {
      const box = pre.closest("figure")?.parentElement;
      if (!box) throw new Error("no box around the figure");
      // The text nodes in order, so a character offset in the code maps to a node and an offset in it.
      const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
      const nodes: { node: Text; start: number }[] = [];
      let length = 0;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!(node instanceof Text)) continue;
        nodes.push({ node, start: length });
        length += node.data.length;
      }
      const at = (offset: number, end: boolean) => {
        const hit = nodes.find(({ node, start }) =>
          end
            ? offset > start && offset <= start + node.data.length
            : offset >= start && offset < start + node.data.length,
        );
        if (!hit) throw new Error(`no text node at ${offset}`);
        return [hit.node, offset - hit.start] as const;
      };
      const flags = [...(pre.textContent ?? "").matchAll(/\S*-\S*/g)];
      const found = flags.map((match) => match[0]);
      const broken: { width: number; token: string; lines: number }[] = [];
      // 200px leaves room for the longest flag (21 characters) inside the padding.
      for (let width = 200; width <= 384; width += 2) {
        box.style.maxWidth = `${width}px`;
        for (const match of flags) {
          const range = document.createRange();
          range.setStart(...at(match.index, false));
          range.setEnd(...at(match.index + match[0].length, true));
          // The fragments of the flag, one per line it sits on.
          const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))
            .size;
          if (lines !== 1) broken.push({ width, token: match[0], lines });
        }
      }
      return { found, broken };
    });
    // Every hyphenated word in the story, so a flag cannot drop out of the check unseen.
    expect(split.found).toEqual(["run-many", "-t", "--skip-nx-cache", "--output-style=stream"]);
    expect(split.broken).toEqual([]);
  });

  for (const id of scrolling) {
    test(`390px, ${theme.id}: ${id} scrolls inside its box, reaches the end of the line, and the page does not scroll sideways`, async ({
      page,
      browserName,
    }) => {
      await open(page, id, theme);
      const { scroll, client } = await pageDoesNotScrollSideways(page);
      expect(scroll).toBeLessThanOrEqual(client);

      const scroller = page.locator("figure pre").locator("xpath=..");
      const before = await scroller.evaluate((el) => ({
        overflow: el.scrollWidth - el.clientWidth,
        right: el.getBoundingClientRect().right,
        figureRight: el.closest("figure")?.getBoundingClientRect().right ?? 0,
        width: getComputedStyle(el).scrollbarWidth,
        color: getComputedStyle(el).scrollbarColor,
      }));
      // The line is longer than the box (it scrolls rather than widening the figure) …
      expect(before.overflow).toBeGreaterThan(0);
      expect(before.figureRight).toBeLessThanOrEqual(client);
      // Thin, in the theme's muted ink (not the browser's `auto` grey). Headless Firefox reports
      // `scrollbar-width: none` for every element, a plain `thin` probe included (overlay
      // scrollbars), so the width is asserted in the other two engines only.
      if (browserName !== "firefox") expect(before.width).toBe("thin");
      expect(before.color).not.toBe("auto");
      // … and scrolling to the end shows the last character inside the box.
      const reached = await scroller.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
        const range = document.createRange();
        range.selectNodeContents(el.querySelector("pre") ?? el);
        const box = el.getBoundingClientRect();
        return {
          // Scrolled all the way along …
          gap: el.scrollWidth - el.clientWidth - el.scrollLeft,
          // … the longest line ends inside the box, so its last character is on screen.
          past: Math.max(...[...range.getClientRects()].map((rect) => rect.right)) - box.right,
        };
      });
      expect(reached.gap).toBeLessThanOrEqual(1);
      expect(reached.past).toBeLessThanOrEqual(0.5);
    });
  }
}

test("a copy button copies the code exactly, by keyboard, and shows copied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.body.dataset["written"] = text;
        },
      },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=text-code--copy&viewMode=story");
  const button = page.getByRole("button", { name: "copy", exact: true });
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "copied", exact: true })).toBeVisible();
  // Wrapped onto several lines on screen, yet one unbroken line on the clipboard.
  await expect(page.locator("body")).toHaveAttribute("data-written", COMMAND);
});

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
  browserName,
  context,
}) => {
  // Only Chromium lets a test read the system clipboard back (`clipboard-read`); the selection
  // test above covers the other two engines.
  test.skip(browserName !== "chromium", "clipboard-read permission is Chromium-only in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=text-code--long-line&viewMode=story");
  await page.locator("figure pre").evaluate((pre) => getSelection()?.selectAllChildren(pre));
  await page.keyboard.press("ControlOrMeta+c");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(sources["text-code--long-line"]);
});
