import { expect, test } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

for (const width of [375, 768, 1280]) {
  test(`at ${width}px a SideColumn with asideLabel folds the aside below lg and shows it from lg`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-sidecolumn--folded-aside"));
    const summary = page.getByText("Ask the reply agent", { exact: true });
    const button = page.getByRole("button", { name: "Suggest a reply" });
    await page.getByRole("complementary").waitFor();
    if (width < 1024) {
      await expect(summary).toBeVisible();
      await expect(button).toBeHidden();
      await summary.click();
      await expect(button).toBeVisible();
    } else {
      await expect(summary).toBeHidden();
      await expect(button).toBeVisible();
    }
  });
}
