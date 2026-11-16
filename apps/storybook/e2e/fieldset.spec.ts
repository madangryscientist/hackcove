import { expect, test } from "@playwright/test";

/**
 * A Fieldset's name is the browser's own `<legend>` computation and its description the
 * `aria-describedby` on the `<fieldset>`: what assistive tech gets, which jsdom does not compute.
 */
test("an invalid Fieldset is named by its legend and described by its error", async ({ page }) => {
  await page.goto("/iframe.html?id=forms-fieldset--invalid&viewMode=story");
  const group = page.getByRole("group", { name: "What is wrong?" });
  await expect(group).toHaveAccessibleDescription("Pick at least one.");
});

test("two checkboxes in a Fieldset are each checked by their label", async ({ page }) => {
  await page.goto("/iframe.html?id=forms-fieldset--checkboxes&viewMode=story");
  const group = page.getByRole("group", { name: "What is wrong?" });
  await group.getByLabel("Wrong opening hours").check();
  await group.getByLabel("Closed for good").check();
  await expect(group.getByLabel("Wrong opening hours")).toBeChecked();
  await expect(group.getByLabel("Closed for good")).toBeChecked();
});
