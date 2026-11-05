import { expect, test, type Locator } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

const boxOf = async (locator: Locator, what: string) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${what} has no box`);
  return box;
};

const REM = 16;

for (const width of [375, 768, 1280]) {
  test(`at ${width}px a SideColumn's aside is 24rem beside the main area from lg and under it below`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-sidecolumn--default"));
    const aside = page.getByRole("complementary");
    const main = page.getByRole("heading", { name: "Thread" });
    await aside.waitFor();
    const [asideBox, mainBox] = [await boxOf(aside, "aside"), await boxOf(main, "main")];
    if (width >= 1024) {
      expect(asideBox.width).toBe(24 * REM);
      expect(asideBox.y).toBeLessThan(mainBox.y + 100);
      expect(asideBox.x).toBeGreaterThan(mainBox.x);
    } else {
      expect(asideBox.y).toBeGreaterThan(mainBox.y);
      expect(asideBox.x).toBeLessThanOrEqual(mainBox.x);
    }
  });

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
