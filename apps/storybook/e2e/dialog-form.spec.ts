import { expect, test } from "@playwright/test";

/**
 * A Dialog with `onSubmit` is one real form in the browser's own `<dialog>`: Enter in a field and
 * the footer's submit button both submit it, and the submit's error is announced inside the dialog,
 * which stays open. jsdom stubs `showModal`, so the real dialog is checked only here.
 */
const ERROR = "Could not create the flag: the key is taken.";

test.beforeEach(async ({ page }) => {
  await page.goto("/iframe.html?id=feedback-dialog--do-form&viewMode=story");
  await page.getByRole("button", { name: "New flag" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Enter in a field submits the form and shows its error in the dialog", async ({ page }) => {
  const modal = page.getByRole("dialog");
  await expect(modal.getByRole("alert")).toHaveCount(0);
  await modal.getByLabel("Key").fill("beta-checkout");
  await modal.getByLabel("Key").press("Enter");
  await expect(modal.getByRole("alert")).toHaveText(ERROR);
  await expect(modal).toBeVisible();
});

test("the footer's submit button submits the form", async ({ page }) => {
  const modal = page.getByRole("dialog");
  await modal.getByRole("button", { name: "Create" }).click();
  await expect(modal.getByRole("alert")).toHaveText(ERROR);
  await expect(modal).toBeVisible();
});
