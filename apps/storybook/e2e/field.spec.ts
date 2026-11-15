import { expect, test, type Locator, type Page } from "@playwright/test";

// What assistive tech is given for a control in an errored Field: jsdom computes no accessible
// description, so this is the one check of it. The wiring does not depend on the theme.

async function open(page: Page, story: string) {
  await page.goto(`/iframe.html?id=${story}&viewMode=story`);
}

async function expectInvalid(control: Locator, error: string) {
  await expect(control).toHaveAttribute("aria-invalid", "true");
  await expect(control).toHaveAccessibleDescription(error);
}

test("every Input form in an errored Field is invalid and described by the error", async ({
  page,
}) => {
  await open(page, "forms-input--invalid");
  await expectInvalid(page.getByRole("textbox", { name: "Display name" }), "Pick a shorter name.");
  await expectInvalid(page.getByRole("textbox", { name: "Shop name" }), "Name the shop.");
  await expectInvalid(page.getByRole("textbox", { name: "Price" }), "Enter a price above zero.");
  await expectInvalid(
    page.getByRole("searchbox", { name: "Search shops" }),
    "Type at least two letters.",
  );
});

test("a Select in an errored Field is invalid and described by the error", async ({ page }) => {
  await open(page, "forms-select--invalid");
  await expectInvalid(page.getByRole("combobox", { name: "Rating" }), "Pick a rating.");
});

test("a Textarea in an errored Field is invalid and described by the error", async ({ page }) => {
  await open(page, "forms-textarea--invalid");
  await expectInvalid(
    page.getByRole("textbox", { name: "Review" }),
    "Say a little more about the shop.",
  );
});

test("a FileDrop in an errored Field is invalid and described by the error", async ({ page }) => {
  await open(page, "forms-filedrop--invalid");
  await expectInvalid(page.getByLabel("Bank statement"), "Choose a CSV file.");
});
