import { expect, test, type Page } from "@playwright/test";
import { schemeScope, setScheme, type Scheme } from "./scheme";

// HC-261: the reading pages sit on the library's long-form scale (`Prose`), so each heading level
// is a visible step from the next, and a docs line holds a reading measure. A demo inside an example
// stays on the app scale, so it looks as the component does anywhere else.
const size = (locator: ReturnType<Page["locator"]>) =>
  locator.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));

const schemes: Scheme[] = ["light", "dark"];
for (const scheme of schemes) {
  test.describe(`${scheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.addInitScript((value) => localStorage.setItem("hackcove-theme", value), scheme);
    });

    test("/ui/button/: h1 > h2 > h3 > body (16px)", async ({ page }) => {
      await page.goto("/ui/button/");
      await setScheme(page, scheme);
      expect(
        await page
          .locator("html")
          .evaluate((el, c) => el.classList.contains(c), schemeScope[scheme]),
      ).toBe(true);
      const h1 = await size(page.getByRole("heading", { level: 1, name: "Button" }));
      const h2 = await size(page.getByRole("heading", { level: 2, name: "Overview" }));
      const h3 = await size(page.getByRole("heading", { level: 3, name: "One primary" }));
      const body = await size(
        page.getByRole("heading", { level: 2, name: "Overview" }).locator("xpath=following::p[1]"),
      );
      expect(body).toBe(16);
      expect(h3, "h3 is larger than body").toBeGreaterThan(body);
      expect(h2, "h2 is larger than h3").toBeGreaterThan(h3);
      expect(h1, "h1 is larger than h2").toBeGreaterThan(h2);
    });

    test("/: 'Explore' is a step down from the Display, at least 24px", async ({ page }) => {
      await page.goto("/");
      await setScheme(page, scheme);
      const explore = await size(page.getByRole("heading", { level: 2, name: "Explore" }));
      expect(explore).toBeGreaterThanOrEqual(24);
    });

    test("/ui/button/: docs paragraphs and list items hold 72ch of their own font", async ({
      page,
    }) => {
      await page.goto("/ui/button/");
      await setScheme(page, scheme);
      const rows = await page.locator("main").evaluate((main) => {
        const out: { text: string; width: number; max: number }[] = [];
        for (const el of main.querySelectorAll("p, li")) {
          // Outside the examples' previews and code.
          if (el.closest("figure") || el.closest("nav, aside")) continue;
          const probe = document.createElement("span");
          probe.style.cssText = "position:absolute;visibility:hidden;width:72ch;height:0";
          el.appendChild(probe);
          const max = probe.getBoundingClientRect().width;
          probe.remove();
          out.push({
            text: (el.textContent ?? "").slice(0, 40),
            width: el.getBoundingClientRect().width,
            max,
          });
        }
        return out;
      });
      expect(rows.length).toBeGreaterThan(10);
      for (const row of rows) {
        expect(row.width, row.text).toBeLessThanOrEqual(row.max + 0.5);
      }
    });

    test("/ui/button/: the Do example's Button is at its own size, not the prose size", async ({
      page,
    }) => {
      await page.goto("/ui/button/");
      await setScheme(page, scheme);
      const figure = page.locator("figure").first();
      const button = figure.getByRole("button", { name: "Save" });
      // The Button story's size: `md` is text-sm.
      expect(await size(button)).toBe(14);
    });
  });
}
