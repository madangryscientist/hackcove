import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("Tabs: one tab stop, then the arrows, Home and End move the current tab", async ({ page }) => {
  await page.goto(story("ui-tabs--default"));
  const tabs = page.getByRole("tab");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveText("Showing activity.");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(tabs.nth(0)).not.toBeFocused();
  await expect(tabs.nth(1)).not.toBeFocused();
});

test("Tabs: a disabled tab is skipped", async ({ page }) => {
  await page.goto(story("ui-tabs--with-disabled-tab"));
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
});

test("SegmentedControl: the arrows move the filled option", async ({ page }) => {
  await page.goto(story("ui-segmentedcontrol--default"));
  const options = page.getByRole("radio");
  await expect(options.nth(1)).toHaveAttribute("aria-checked", "true");
  await options.nth(1).focus();
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(2)).toBeFocused();
  await expect(options.nth(2)).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(options.nth(1)).toHaveAttribute("aria-checked", "true");
});

test("Drawer: focus stays inside, Esc closes it and the scrim closes it", async ({ page }) => {
  await page.goto(story("ui-drawer--default"));
  const drawer = page.getByRole("dialog", { name: "HC-65 · Tabs" });
  await expect(drawer).toBeVisible();
  // The page behind is inert: Tab cycles the drawer (and the browser's own UI), never the Open button.
  const behind = page.getByRole("button", { name: "Open", exact: true });
  for (let press = 0; press < 6; press++) {
    await page.keyboard.press("Tab");
    await expect(behind).not.toBeFocused();
  }
  await drawer.getByRole("button", { name: "Close" }).focus();
  await expect(drawer.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();

  await page.getByRole("button", { name: "Open" }).click();
  await expect(drawer).toBeVisible();
  await page.mouse.click(20, 300);
  await expect(drawer).toBeHidden();

  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(drawer).toBeHidden();
});

test("Drawer: the panel sits against the right edge, full height", async ({ page }) => {
  await page.goto(story("ui-drawer--default"));
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  const view = page.viewportSize();
  if (!view) throw new Error("no viewport");
  // It slides in, so wait for it to settle against the edge.
  await expect
    .poll(async () => {
      const box = await drawer.boundingBox();
      return box ? Math.round(box.x + box.width) : null;
    })
    .toBe(view.width);
  const box = await drawer.boundingBox();
  expect(Math.round(box?.height ?? 0)).toBe(view.height);
});
