import { expect, test } from "@playwright/test";

test("on a phone the On this page list is folded above the article and opens to its links", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const nav = page.getByRole("navigation", { name: "On this page" });
  await expect(nav.getByRole("link", { name: "API" })).toBeHidden();
  await nav.getByText("On this page", { exact: true }).first().click();
  await expect(nav.getByRole("link", { name: "API" })).toBeVisible();
});
