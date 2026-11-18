import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story&globals=theme:default`;

const builds = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(storyUrl("layout-show--default"));
  return {
    table: page.getByRole("table", { name: "Builds" }),
    rows: page.getByRole("list", { name: "Builds" }),
  };
};

test("at 375px the builds show as rows, and no table is rendered", async ({ page }) => {
  const { table, rows } = await builds(page, 375);
  await expect(rows).toBeVisible();
  await expect(table).toBeHidden();
  await expect(page.getByRole("table")).toHaveCount(0);
});

for (const width of [768, 1280]) {
  test(`at ${width}px the builds table shows from sm and the rows are hidden`, async ({ page }) => {
    const { table, rows } = await builds(page, width);
    await expect(table).toBeVisible();
    await expect(rows).toBeHidden();
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
