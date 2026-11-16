import { expect, test } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

for (const width of [375, 768, 1280]) {
  test(`at ${width}px the builds table shows from sm and the rows below it`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(storyUrl("layout-show--default"));
    const table = page.getByRole("table", { name: "Builds" });
    const rows = page.getByRole("list", { name: "Builds" });
    if (width >= 640) {
      await expect(table).toBeVisible();
      await expect(rows).toBeHidden();
    } else {
      await expect(rows).toBeVisible();
      await expect(table).toBeHidden();
      await expect(page.getByRole("table")).toHaveCount(0);
    }
  });
}

test("a field inside a Show keeps its value when the width hides it and shows it again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(storyUrl("layout-show--default"));
  const note = page.getByRole("textbox", { name: "Note for a narrow screen" });
  await note.fill("Ship it on Friday");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(note).toBeHidden();
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(note).toHaveValue("Ship it on Friday");
});
