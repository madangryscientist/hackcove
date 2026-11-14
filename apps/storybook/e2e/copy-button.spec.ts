import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("a click writes the text, shows copied and announces it, and a second click does it again", async ({
  page,
}) => {
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
  await page.goto(story("actions-copybutton--default"));
  const button = page.getByRole("button", { name: "copy", exact: true });
  await expect(button.getByText("copied", { exact: true })).toBeHidden();
  await expect(page.getByRole("status")).toHaveText("");
  for (const time of [1, 2]) {
    await page.evaluate(() => delete document.body.dataset["written"]);
    await button.click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-written",
      "bun add @hackcove/ui-react",
    );
    // The name stays `copy`; the copied label shows, the idle one hides, and the region says it.
    await expect(button, `copy ${time}`).toHaveAccessibleName("copy");
    await expect(button.getByText("copied", { exact: true })).toBeVisible();
    await expect(button.getByText("copy", { exact: true })).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("copied");
  }
});

test("a missing clipboard does not throw and leaves the label on copy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.goto(story("actions-copybutton--default"));
  await page.getByRole("button", { name: "copy", exact: true }).click();
  await expect(page.getByRole("button", { name: "copy", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
