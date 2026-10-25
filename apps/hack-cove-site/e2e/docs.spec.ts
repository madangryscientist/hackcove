import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { NONE } from "@hackcove/themes-shared/none";
import { themeScope } from "@hackcove/themes-shared/scope";
import { componentPages } from "../src/content/components";

// Same source of truth as the picker: one folder per theme under themes/.
const themesDir = `${import.meta.dirname}/../../../themes`;
const folders = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();
const scopeOf = (folder: string) =>
  themeScope(readFileSync(`${themesDir}/${folder}/theme.css`, "utf8")) ?? "";
const scopes = folders.map(scopeOf);

const pages = [
  { path: "/ui/", heading: "Getting started" },
  ...componentPages.map(({ slug, name }) => ({ path: `/ui/${slug}/`, heading: name })),
];

/** The header's `<select aria-label="Theme">`; a plain label match also finds the "Themes" section. */
const picker = (page: Page) => page.getByRole("combobox", { name: "Theme" });

/** The scope classes on `<html>`, which is where the picker puts the chosen theme's. */
const scopeClasses = (page: Page) =>
  page
    .locator("html")
    .evaluate((el, all) => all.filter((scope) => el.classList.contains(scope)), scopes);

test("the themes folder lists at least one theme", () => {
  expect(folders.length).toBeGreaterThan(0);
});

for (const { path, heading } of pages) {
  test(`${path} renders under default and under every theme's own scope class`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    const select = picker(page);
    await expect(select.locator("option")).toHaveCount(folders.length + 1);

    await select.selectOption(NONE);
    expect(await scopeClasses(page)).toEqual([]);

    for (const folder of folders) {
      await select.selectOption(folder);
      expect(await scopeClasses(page)).toEqual([scopeOf(folder)]);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
}

test("a chosen theme is remembered and applied again on the next page", async ({ page }) => {
  await page.goto("/ui/");
  await picker(page).selectOption(NONE);
  await page.goto("/ui/button/");
  expect(await scopeClasses(page)).toEqual([]);
  await expect(picker(page)).toHaveValue(NONE);
});

test("each theme reskins the page: its page paint differs from default", async ({ page }) => {
  await page.goto("/ui/card/");
  const select = picker(page);
  const paint = () => page.locator("html").evaluate((el) => getComputedStyle(el).backgroundColor);
  await select.selectOption(NONE);
  const plain = await paint();
  for (const folder of folders) {
    await select.selectOption(folder);
    expect(await paint()).not.toBe(plain);
  }
});

test("/ui/llms.txt is served as plain text, one section per pilot component", async ({
  request,
}) => {
  const response = await request.get("/ui/llms.txt");
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text).toContain("fully integrated with its theming");
  for (const name of ["Button", "Card", "Tabs"]) expect(text).toContain(`\n## ${name}\n`);
});
