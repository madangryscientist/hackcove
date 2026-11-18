import { expect, test } from "@playwright/test";

test("on a phone the folded rail on /ui/button/ names the page you are on", async ({ page }) => {
  await page.goto("/ui/button/");
  // The folded rail's `<summary>`, found by the text it shows once the frame has hydrated.
  await expect(
    page
      .getByRole("complementary", { name: "All components" })
      .getByText("All components: Button", { exact: true }),
  ).toBeVisible();
});
