import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("a blocked Button shows its reason on keyboard focus, as its description, and Escape hides it", async ({
  page,
}) => {
  await page.goto(story("actions-button--do-disabled-reason"));
  const save = page.getByRole("button", { name: "Save" });
  await expect(save).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(save).toBeFocused();
  const tip = page.getByRole("tooltip");
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText("Pick a shop first");
  await expect(tip).toBeInViewport({ ratio: 1 });
  await expect(save).toHaveAccessibleDescription("Pick a shop first");
  await expect(save).toHaveAttribute("aria-disabled", "true");

  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
  await expect(save).toBeFocused();
});

test("an IconButton shows its label on hover and hides it when the pointer leaves", async ({
  page,
}) => {
  await page.goto(story("actions-iconbutton--do-label"));
  const button = page.getByRole("button", { name: "Delete quote" });
  await expect(button).toBeVisible();
  // The tooltip repeats the name, so it is hidden from assistive tech: found by its text.
  const tip = page.locator("[role=tooltip]", { hasText: "Delete quote" });

  await button.hover();
  // The half-second wait is a CSS animation delay; a web-first assertion waits it out.
  await expect(tip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();
});

// The tooltip stories hold the tooltip open by focusing the trigger in `play`, so their shots show it.
for (const [id, text] of [
  ["actions-button--disabled-reason-tooltip", "Pick a shop first"],
  ["actions-iconbutton--tooltip", "Settings"],
  ["content-pill--title-tooltip", "Accepted on 12 Oct by Ada Lovelace"],
] as const) {
  test(`${id} holds its tooltip open`, async ({ page }) => {
    await page.goto(story(id));
    const tip = page.locator("[role=tooltip]", { hasText: text });
    await expect(tip).toBeVisible();
    await expect(tip).toBeInViewport({ ratio: 1 });
  });
}

test("the arrow keys reach a Tabs option with a disabledReason, choose nothing and show the reason", async ({
  page,
}) => {
  await page.goto(story("navigation-tabs--do-disabled-reason"));
  const overview = page.getByRole("tab", { name: "Overview" });
  const billing = page.getByRole("tab", { name: "Billing" });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(billing).toBeFocused();
  await expect(billing).toHaveAttribute("aria-disabled", "true");
  await expect(billing).toHaveAccessibleDescription("Only an owner sees billing");
  await expect(page.getByRole("tooltip")).toHaveText("Only an owner sees billing");
  await expect(overview).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tab", { name: "Builds" })).toHaveAttribute("aria-selected", "true");
});
