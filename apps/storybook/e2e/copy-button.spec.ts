import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("a click writes the text and swaps the label to copied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.body.dataset["written"] = text;
        },
      },
    });
  });
  await page.goto(story("ui-copybutton--default"));
  await page.getByRole("button", { name: "copy", exact: true }).click();
  await expect(page.getByRole("button", { name: "copied", exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-written", "bun add @hackcove/ui");
});

test("a missing clipboard does not throw and leaves the label on copy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.goto(story("ui-copybutton--default"));
  await page.getByRole("button", { name: "copy", exact: true }).click();
  await expect(page.getByRole("button", { name: "copy", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
