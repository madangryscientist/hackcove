import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("a missing clipboard does not throw and leaves the label on copy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.goto(story("actions-copybutton--default"));
  const button = page.getByRole("button", { name: "Copy", exact: true });
  await button.click();
  await expect(button.getByText("Copy", { exact: true })).toBeVisible();
  await expect(button.getByText("Copied", { exact: true })).toBeHidden();
  await expect(button).not.toHaveAttribute("data-copied");
  await expect(page.getByRole("status")).toHaveText("");
  expect(errors).toEqual([]);
});
