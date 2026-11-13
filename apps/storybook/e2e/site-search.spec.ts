import { expect, test, type Page } from "@playwright/test";

/**
 * SiteSearch's keys, in Chromium, Firefox and WebKit: the shortcut opens it with focus in the
 * field, typing ranks the pages, Enter follows the first, the arrows move between the links and
 * Esc closes it and hands focus back to the trigger.
 */
const story = "/iframe.html?id=navigation-sitesearch--default&viewMode=story";

const open = async (page: Page) => {
  await page.goto(story);
  const trigger = page.getByRole("button", { name: "Search components" });
  await expect(trigger).toBeVisible();
  return trigger;
};

const dialogOf = (page: Page) => page.getByRole("dialog", { name: "Search components" });

for (const shortcut of ["Control+k", "Meta+k"]) {
  test(`${shortcut} opens it with focus in the field, and "dia" lists Dialog then FieldDialog`, async ({
    page,
  }) => {
    await open(page);
    await page.keyboard.press(shortcut);
    const dialog = dialogOf(page);
    await expect(dialog).toBeVisible();
    const field = dialog.getByRole("searchbox", { name: "Search components" });
    await expect(field).toBeFocused();
    await page.keyboard.type("dia");
    const links = dialog.getByRole("link");
    await expect(links.nth(0)).toHaveAccessibleName(/^Dialog/);
    await expect(links.nth(1)).toHaveAccessibleName(/^FieldDialog/);
    // Pressed again while open, it does nothing: the field keeps focus and its text.
    await page.keyboard.press(shortcut);
    await expect(field).toBeFocused();
    await expect(field).toHaveValue("dia");
  });
}

test("Enter in the field follows the first result", async ({ page }) => {
  await open(page);
  await page.keyboard.press("Control+k");
  await page.keyboard.type("dia");
  await expect(dialogOf(page).getByRole("link").first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#dialog$/);
  await expect(dialogOf(page)).toBeHidden();
});

test("Esc closes it from the field with text in it, and focus is back on the trigger", async ({
  page,
}) => {
  const trigger = await open(page);
  await trigger.click();
  const dialog = dialogOf(page);
  await expect(dialog.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("dia");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("ArrowDown moves from the field to the first link, then between the links, and ArrowUp back", async ({
  page,
}) => {
  await open(page);
  await page.keyboard.press("Control+k");
  const dialog = dialogOf(page);
  await page.keyboard.type("dia");
  const links = dialog.getByRole("link");
  await page.keyboard.press("ArrowDown");
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(dialog.getByRole("searchbox")).toBeFocused();
});

test('"zzz" says there are no results, and the live region reads the count', async ({ page }) => {
  await open(page);
  await page.keyboard.press("Control+k");
  const dialog = dialogOf(page);
  const status = dialog.getByRole("status");
  await expect(dialog.getByText("Type a name")).toBeVisible();
  await page.keyboard.type("dia");
  await expect(status).toHaveText(/^\d+ results?$/);
  const count = await dialog.getByRole("link").count();
  await expect(status).toHaveText(count === 1 ? "1 result" : `${count} results`);
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("zzz");
  await expect(dialog.getByText("No results for zzz")).toBeVisible();
  await expect(status).toHaveText("No results");
  await expect(dialog.getByRole("link")).toHaveCount(0);
});
