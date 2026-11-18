import { expect, type Page, test } from "@playwright/test";

const story = (page: Page, id: string) =>
  page.goto(`/iframe.html?id=forms-daterangepicker--${id}&viewMode=story&globals=theme:default`);

const segment = (page: Page, part: "day" | "month" | "year", side: "Start" | "End") =>
  page.getByRole("spinbutton", { name: new RegExp(`^${part}, ${side} date`, "i") });

const sideText = (page: Page, side: "Start" | "End") =>
  page.getByRole("group", { name: `${side} date` });

const caption = (page: Page) => page.getByText(/^(From .* to .*\.|No period yet\.)$/);

// DoPresets holds the range in its own state and prints it, and posts it under `from` and `to`.
test.describe("DateRangePicker", () => {
  test("typing both sides reports the range and posts each side", async ({ page }) => {
    await story(page, "do-presets");
    await page.getByRole("button", { name: /^Calendar/ }).click();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(caption(page)).toHaveText("No period yet.");

    await segment(page, "day", "Start").click();
    await page.keyboard.type("01102026");
    await segment(page, "day", "End").click();
    await page.keyboard.type("31102026");

    await expect(caption(page)).toHaveText("From 2026-10-01 to 2026-10-31.");
    await expect(page.locator('input[name="from"]')).toHaveValue("2026-10-01");
    await expect(page.locator('input[name="to"]')).toHaveValue("2026-10-31");
  });

  test("an end before the start reports null and marks the field invalid", async ({ page }) => {
    await story(page, "do-presets");
    await expect(caption(page)).toHaveText("From 2026-10-01 to 2026-10-31.");
    await segment(page, "day", "End").click();
    await page.keyboard.type("15092026");
    await page.keyboard.press("Tab");

    await expect(caption(page)).toHaveText("No period yet.");
    await expect(page.getByText("The end date is before the start date.")).toBeVisible();
    await expect(sideText(page, "End").locator("[aria-invalid=true]").first()).toBeAttached();
    await expect(page.locator('input[name="from"]')).toHaveValue("");
  });

  test("two clicks in the calendar pick the range and close it", async ({ page }) => {
    await story(page, "do-presets");
    await page.getByRole("button", { name: /^Calendar/ }).click();
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    await grid
      .getByRole("gridcell", { name: /\b10\b/ })
      .first()
      .click();
    await grid
      .getByRole("gridcell", { name: /\b20\b/ })
      .first()
      .click();

    await expect(grid).toBeHidden();
    await expect(caption(page)).toHaveText("From 2026-10-10 to 2026-10-20.");
  });

  test("the keyboard alone picks a range in the calendar", async ({ page }) => {
    await story(page, "do-presets");
    await page.getByRole("button", { name: /^Calendar/ }).focus();
    await page.keyboard.press("Enter");
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    // The grid opens on the range's start, 1 October 2026.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    // React Aria moves focus one day on after the first Enter, to 3 October, to show a range is open.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(grid).toBeHidden();
    await expect(caption(page)).toHaveText("From 2026-10-02 to 2026-10-10.");
  });

  test("Escape closes the calendar without changing the range", async ({ page }) => {
    await story(page, "do-presets");
    await page.getByRole("button", { name: /^Calendar/ }).click();
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    await grid
      .getByRole("gridcell", { name: /\b12\b/ })
      .first()
      .click();
    await page.keyboard.press("Escape");

    await expect(grid).toBeHidden();
    await expect(caption(page)).toHaveText("From 2026-10-01 to 2026-10-31.");
  });

  test("a preset reports its range and closes the calendar", async ({ page }) => {
    await story(page, "do-presets");
    await page.getByRole("button", { name: /^Calendar/ }).click();
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    await page.getByRole("button", { name: "Last 7 days" }).click();

    await expect(grid).toBeHidden();
    await expect(caption(page)).toHaveText("From 2026-10-25 to 2026-10-31.");
    await expect(sideText(page, "Start")).toHaveText("25/10/2026");
    await expect(sideText(page, "End")).toHaveText("31/10/2026");
  });
});

// A modal <dialog> makes everything outside it inert, and react-aria portals the calendar to
// <body>: the calendar must still open above the dialog and pick a range.
test(`DateRangePicker in a Dialog opens its calendar above it and picks a range`, async ({
  page,
}) => {
  await story(page, "in-dialog");
  const modal = page.getByRole("dialog", { name: "Filter the timeline" });
  await expect(modal).toBeVisible();

  await modal.getByRole("button", { name: /^Calendar/ }).click();
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  await expect(grid).toBeInViewport({ ratio: 1 });

  await grid.getByRole("gridcell", { name: /\b5\b/ }).first().click();
  await grid
    .getByRole("gridcell", { name: /\b15\b/ })
    .first()
    .click();
  await expect(grid).toBeHidden();
  await expect(sideText(page, "Start")).toHaveText("05/10/2026");
  await expect(sideText(page, "End")).toHaveText("15/10/2026");
  await expect(modal).toBeVisible();
});
