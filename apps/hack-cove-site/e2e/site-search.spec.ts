import { expect, test, type Page } from "@playwright/test";
import { toggle } from "./scheme";

/**
 * The header's search: on the home page and the docs index, at a desktop and a phone width, the
 * trigger sits in the header row beside the colour toggle, Ctrl+K opens it, and "dia" then Enter
 * lands on the Dialog page. At 390px the open dialog does not make the page scroll sideways.
 */
const searchReady = (page: Page) =>
  page.locator('astro-island[component-export="SiteSearch"]:not([ssr])').waitFor();

for (const width of [1280, 390]) {
  for (const path of ["/", "/ui/"]) {
    test(`${path} at ${width}px: the trigger is in the header, Ctrl+K opens the search and "dia" Enter lands on /ui/dialog/`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await searchReady(page);
      const header = page.getByRole("banner");
      const trigger = header.getByRole("button", { name: "Search components" });
      await expect(trigger).toBeVisible();
      // The trigger and the toggle share the header's one row.
      const at = await trigger.boundingBox();
      const toggleAt = await toggle(page).boundingBox();
      expect(
        at && toggleAt && Math.abs(at.y + at.height / 2 - (toggleAt.y + toggleAt.height / 2)),
      ).toBeLessThanOrEqual(1);
      expect(at && toggleAt && at.x < toggleAt.x).toBe(true);

      await page.keyboard.press("Control+k");
      const dialog = page.getByRole("dialog", { name: "Search components" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("searchbox")).toBeFocused();
      await page.keyboard.type("dia");
      await expect(dialog.getByRole("link").first()).toHaveAccessibleName(/^Dialog/);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, "sideways scroll with the dialog open").toBeLessThanOrEqual(0);
      // The header row does not wrap; the dialog opened from it must, or a long description is cut.
      const clipped = await dialog
        .getByRole("list")
        .evaluate((list) => list.scrollWidth - list.clientWidth);
      expect(clipped, "a result row wider than the dialog").toBeLessThanOrEqual(0);

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/ui\/dialog\/$/);
    });
  }
}
