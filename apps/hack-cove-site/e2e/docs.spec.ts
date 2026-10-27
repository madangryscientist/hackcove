import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { themeScope } from "@hackcove/themes-shared/scope";
import { componentPages } from "../src/content/components/index";

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

/** The header's Select (`aria-label="Theme"`): one option per theme folder, on every page. */
const picker = (page: Page) => page.getByRole("combobox", { name: "Theme" });
const choose = (page: Page, folder: string) => picker(page).selectOption(folder);

/** The scope classes on `<html>`, which is where the picker puts the chosen theme's. */
const scopeClasses = (page: Page) =>
  page
    .locator("html")
    .evaluate((el, all) => all.filter((scope) => el.classList.contains(scope)), scopes);

test("the themes folder lists at least one theme", () => {
  expect(folders.length).toBeGreaterThan(0);
});

for (const { path, heading } of pages) {
  test(`${path} renders under every theme's own scope class`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(picker(page).getByRole("option")).toHaveCount(folders.length);

    for (const folder of folders) {
      await choose(page, folder);
      expect(await scopeClasses(page)).toEqual([scopeOf(folder)]);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
}

test("a chosen theme is remembered and applied again on the next page", async ({ page }) => {
  await page.goto("/ui/");
  const other = folders.at(-1) ?? "";
  await choose(page, other);
  await page.goto("/ui/button/");
  expect(await scopeClasses(page)).toEqual([scopeOf(other)]);
  await expect(picker(page)).toHaveValue(other);
});

test("each theme reskins the page: its page paint differs from the stock components'", async ({
  page,
}) => {
  await page.goto("/ui/card/");
  const paint = () => page.locator("html").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.locator("html").evaluate((el, all) => el.classList.remove(...all), scopes);
  const plain = await paint();
  for (const folder of folders) {
    await choose(page, folder);
    expect(await paint()).not.toBe(plain);
  }
});

const everyPage = ["/", "/contracting/", "/pixelslash/", ...pages.map(({ path }) => path)];

test("the theme picker is in the header of every page, and a choice carries to the next", async ({
  page,
}) => {
  const other = folders.at(-1) ?? "";
  await page.goto("/");
  await choose(page, other);
  for (const path of ["/contracting/", "/pixelslash/", "/ui/tabs/"]) {
    await page.goto(path);
    await expect(picker(page)).toHaveValue(other);
    expect(await scopeClasses(page)).toEqual([scopeOf(other)]);
  }
});

test("at 390px no page scrolls sideways, the picker is inside the viewport and no prop is clipped", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 900 });
  for (const path of new Set(everyPage)) {
    await page.goto(path);
    await picker(page).waitFor();
    const { overflow, pickerRight } = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pickerRight:
        document.querySelector("select[aria-label='Theme']")?.getBoundingClientRect().right ?? 0,
    }));
    expect(overflow, `${path}: horizontal overflow`).toBe(0);
    expect(pickerRight, `${path}: picker right edge`).toBeLessThanOrEqual(390);
  }
});

for (const width of [1440, 390]) {
  test(`at ${width}px a prop's description is whole: nothing in the props list is clipped`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui/button/");
    const entry = page.locator("dl").first();
    await entry.waitFor();
    const clipped = await page
      .locator("main")
      .evaluate(
        (main) =>
          [...main.querySelectorAll("dl, dd, dt, code")].filter(
            (el) =>
              el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline",
          ).length,
      );
    expect(clipped).toBe(0);
  });
}

for (const width of [1440, 1280]) {
  test(`at ${width}px a Do/Don't pair stacks, Do above Don't, each frame as wide as a lone Do`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui/tabs/");
    const frames = page.locator("main figure");
    await frames.first().waitFor();
    const [lone, doSide, dontSide] = await frames.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        return { x: box.x, bottom: box.bottom, top: box.top, wide: box.width };
      }),
    );
    // The first topic has only a Do; every frame is the content column wide, one under another.
    expect([doSide?.wide, dontSide?.wide, dontSide?.x]).toEqual([
      lone?.wide,
      lone?.wide,
      doSide?.x,
    ]);
    expect(dontSide?.top).toBeGreaterThan(doSide?.bottom ?? Infinity);
  });

  test(`at ${width}px no example's code is clipped on any component page`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    for (const { path } of pages) {
      await page.goto(path);
      const clipped = await page
        .locator("main pre")
        .evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
      expect(clipped, `${path}: code that scrolls sideways`).toBe(0);
    }
  });
}

test("at 390px the component rail is folded and the page comes first", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/ui/button/");
  const heading = page.getByRole("heading", { level: 1 });
  await heading.waitFor();
  const nav = page.getByRole("complementary").getByRole("link", { name: "Getting started" });
  const summary = page.getByText("All components");
  await expect(summary).toBeVisible();
  await expect(nav).toBeHidden();
  const box = await heading.boundingBox();
  expect(box?.y).toBeLessThan(250);
});

test("/ui/llms.txt is served as plain text, one section per component page", async ({
  request,
}) => {
  const response = await request.get("/ui/llms.txt");
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text).toContain("fully integrated with its theming");
  for (const { name } of componentPages) expect(text).toContain(`\n## ${name}\n`);
});

test("the logo ink and halo are the same fixed blue under every theme's scope class", async ({
  page,
}) => {
  await page.goto("/");
  const colours = () =>
    page.evaluate(() =>
      [".logo", ".logo-glow"].map((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).color : "";
      }),
    );
  for (const folder of folders) {
    await choose(page, folder);
    expect(await scopeClasses(page)).toEqual([scopeOf(folder)]);
    expect(await colours()).toEqual(["rgb(79, 134, 247)", "rgb(79, 134, 247)"]);
  }
});
