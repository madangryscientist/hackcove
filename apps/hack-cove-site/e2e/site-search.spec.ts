import { expect, test } from "@playwright/test";
import { islandHydrated } from "./scheme";

/**
 * The header's search, on desktop and on a phone: from the home page Ctrl+K opens it, and "dia" then
 * Enter lands on the Dialog page. The open dialog makes nothing scroll sideways.
 */
test(`from /, Ctrl+K opens the search and "dia" Enter lands on /ui/dialog/`, async ({ page }) => {
  await page.goto("/");
  await islandHydrated(page, "SiteSearch");
  await expect(
    // Desktop: the button's visible text, "Search". Phone: the icon button, named by `label`.
    page.getByRole("banner").getByRole("button", { name: /^Search( components)?$/ }),
  ).toBeVisible();

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search components" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("dia");
  await expect(dialog.getByRole("link").first()).toHaveAccessibleName(/^Dialog/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "sideways scroll with the dialog open").toBe(0);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ui\/dialog\/$/);
});
