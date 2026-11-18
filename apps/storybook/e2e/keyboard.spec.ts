import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("Tabs: Tab enters the group on the current tab", async ({ page }) => {
  await page.goto(story("navigation-tabs--default"));
  const tabs = page.getByRole("tab");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(tabs.nth(0)).toBeFocused();
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

test("TableEditCell: a click on the editor's own button saves", async ({ page }) => {
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

test("InlineEdit in a cell: Enter opens the editor, a save and Esc return the focus, the cell keeps its other content", async ({
  page,
}) => {
  await page.goto(story("data-table--inline-edit-in-cell"));
  const value = page.getByRole("button", { name: "Groceries Edit category" });
  await value.focus();
  await page.keyboard.press("Enter");
  const select = page.getByRole("combobox", { name: "Category" });
  await expect(select).toBeFocused();
  await expect(page.getByText("Card ending 4417")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(select).toHaveCount(0);
  await expect(value).toBeFocused();
  await page.keyboard.press("Space");
  await page.getByRole("combobox", { name: "Category" }).selectOption("Transport");
  await expect(page.getByRole("button", { name: "Transport Edit category" }).first()).toBeFocused();
});
