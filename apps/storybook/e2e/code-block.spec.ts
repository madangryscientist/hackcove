import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themeScope } from "@hackcove/themes-shared/scope";

// Same source of truth as the toolbar switcher and theme.spec.ts: one theme per CSS file under themes/*/.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const COMMAND = "bunx playwright test --project=chromium --reporter=list --output=out";

/** Each story holds one long one-line command (or line of code) in a box at most 24rem wide. */
const wrapping = ["text-code--long-line", "text-code--copy"];
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
