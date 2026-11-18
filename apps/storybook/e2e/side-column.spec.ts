import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

const open = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(storyUrl("layout-sidecolumn--folded-aside"));
  await page.getByRole("complementary").waitFor();
  return {
    summary: page.getByText("Ask the reply agent", { exact: true }),
    button: page.getByRole("button", { name: "Suggest a reply" }),
  };
};

for (const width of [375, 768]) {
  test(`at ${width}px a SideColumn with asideLabel folds the aside below lg, and its summary opens it`, async ({
    page,
  }) => {
    const { summary, button } = await open(page, width);
    await expect(summary).toBeVisible();
    await expect(button).toBeHidden();
    await summary.click();
    await expect(button).toBeVisible();
  });
}

test("at 1280px a SideColumn with asideLabel shows the aside from lg, with no summary", async ({
  page,
}) => {
  const { summary, button } = await open(page, 1280);
  await expect(summary).toBeHidden();
  await expect(button).toBeVisible();
});
