import { expect, test } from "@playwright/test";

test("on a phone the folded rail on /ui/button/ names the page you are on", async ({ page }) => {
  await page.goto("/ui/button/");
  await expect(
    page.getByRole("complementary", { name: "All components" }).locator("summary"),
  ).toHaveText("All components: Button");
});
