import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("Tabs: one tab stop, then the arrows, Home and End move the current tab", async ({ page }) => {
  await page.goto(story("navigation-tabs--default"));
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
  // Tab leaves the group: it never lands on another tab. (Not "tab 0 is blurred": the story's tabs
  // are the page's only tab stop, so Firefox wraps Tab straight back to the first one.)
  await expect(tabs.nth(1)).not.toBeFocused();
  await expect(tabs.nth(2)).not.toBeFocused();
  // Roving tabindex is what makes the group one tab stop: only the current tab is reachable by Tab.
  await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
});

test("Tabs: a disabled tab is skipped", async ({ page }) => {
  await page.goto(story("navigation-tabs--with-disabled-tab"));
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
});

test("SegmentedControl: the arrows move the filled option", async ({ page }) => {
  await page.goto(story("forms-segmentedcontrol--default"));
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
  await page.goto(story("feedback-drawer--default"));
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
  await page.goto(story("feedback-drawer--default"));
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

test("Lightbox: the arrows step, Esc and the scrim close it, the photo does not", async ({
  page,
}) => {
  await page.goto(story("feedback-lightbox--default"));
  const viewer = page.getByRole("dialog", { name: /^Photo \d of 3$/ });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText("1 of 3")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByText("2 of 3")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.getByText("1 of 3")).toBeVisible();
  await viewer.getByRole("img").click();
  await expect(viewer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();

  await page.getByRole("button", { name: "View photos" }).click();
  await expect(viewer).toBeVisible();
  await page.mouse.click(20, 400);
  await expect(viewer).toBeHidden();
});

test("TableEditCell: Enter opens the editor, Esc returns the focus to the value", async ({
  page,
}) => {
  await page.goto(story("data-table--inline-edit"));
  const value = page.getByRole("button", { name: "Groceries Edit category" });
  await value.focus();
  await page.keyboard.press("Enter");
  const select = page.getByRole("combobox", { name: "Category" });
  await expect(select).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(select).toHaveCount(0);
  await expect(value).toBeFocused();
});

test("TableEditCell: Space opens the editor too, and a save returns the focus to the new value", async ({
  page,
}) => {
  await page.goto(story("data-table--inline-edit"));
  await page.getByRole("button", { name: "Groceries Edit category" }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("combobox", { name: "Category" }).selectOption("Transport");
  await expect(page.getByRole("button", { name: "Transport Edit category" })).toBeFocused();
});

test("TableEditCell: a click on the editor's own button saves, in every engine", async ({
  page,
}) => {
  await page.goto(story("data-table--inline-edit"));
  await page.getByRole("button", { name: "Weekly shop Edit note" }).click();
  const input = page.getByRole("textbox", { name: "Note" });
  await expect(input).toBeFocused();
  await input.fill("Monthly shop");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Monthly shop Edit note" })).toBeFocused();
});

test("TableEditCell: a press outside closes the editor without a save", async ({ page }) => {
  await page.goto(story("data-table--inline-edit"));
  await page.getByRole("button", { name: "Weekly shop Edit note" }).click();
  await page.getByRole("textbox", { name: "Note" }).fill("Monthly shop");
  await page.getByRole("cell", { name: "Woolworths" }).click();
  await expect(page.getByRole("textbox", { name: "Note" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Weekly shop Edit note" })).toBeVisible();
});
