import { expect, test } from "@playwright/test";
import { componentPages, componentSections } from "../src/content/components/index";
import {
  everyPage,
  labelFor,
  pages,
  schemeScope,
  scopeClasses,
  scopes,
  setScheme,
  themeList,
  toggle,
  hydrated,
  useScope,
} from "./scheme";

test("the themes folder lists at least one theme", () => {
  expect(themeList.length).toBeGreaterThan(0);
});

for (const { path, heading } of pages) {
  test(`${path} renders under each scheme's own scope class`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Theme" })).toHaveCount(0);

    for (const scheme of ["dark", "light"] as const) {
      await setScheme(page, scheme);
      await expect.poll(() => scopeClasses(page)).toEqual([schemeScope[scheme]]);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
}

test("the toggle flips the scope class on <html> and the colour-scheme with it", async ({
  page,
}) => {
  await page.goto("/");
  await setScheme(page, "dark");
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.dark]);
  await toggle(page).click();
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await expect
    .poll(() => page.locator("html").evaluate((el) => el.style.colorScheme))
    .toBe("light");
  await toggle(page).click();
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.dark]);
  await expect.poll(() => page.locator("html").evaluate((el) => el.style.colorScheme)).toBe("dark");
});

test("there is no theme Select in the header: the toggle is the only control", async ({ page }) => {
  await page.goto("/ui/");
  await hydrated(page);
  await expect(page.locator("header select")).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(toggle(page)).toHaveCount(1);
});

test("a choice is remembered across a reload and on the next page", async ({ page }) => {
  await page.goto("/ui/");
  await setScheme(page, "light");
  await page.reload();
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await page.goto("/ui/button/");
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await setScheme(page, "dark");
  await page.reload();
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.dark]);
});

for (const scheme of ["dark", "light"] as const) {
  test(`a first visit follows prefers-color-scheme: ${scheme}`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    await page.goto("/contracting/");
    await expect.poll(() => scopeClasses(page)).toEqual([schemeScope[scheme]]);
    await hydrated(page);
    await expect(toggle(page)).toHaveAccessibleName(
      scheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
    await context.close();
  });
}

test("a saved value from the old theme picker is ignored", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("hackcove-theme", "some-theme"));
  await page.goto("/");
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await context.close();
});

// The server renders the toggle for dark (`initial="dark"`), so its markup is the server's guess until
// the island hydrates. Blocking the island's JS keeps it un-hydrated: the name must already be the
// scheme `<html>` is in, which the toggle's own CSS picks (HC-218): no script.
for (const scheme of ["dark", "light"] as const) {
  test(`before hydration the toggle's label names the scheme in place: ${scheme}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/contracting/");
    await expect.poll(() => scopeClasses(page)).toEqual([schemeScope[scheme]]);
    await expect(toggle(page)).toHaveAccessibleName(labelFor(scheme));
    await context.close();
  });
}

test("the right scheme is on <html> before the page scripts run: no flash", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  // The island script is a module, which runs after the head script; block it and the head script's
  // class must still be there.
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/");
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await context.close();
});

test("each theme reskins the page: its page paint differs from the stock components'", async ({
  page,
}) => {
  await page.goto("/ui/card/");
  const paint = () => page.locator("html").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.locator("html").evaluate((el, all) => el.classList.remove(...all), scopes);
  const plain = await paint();
  for (const scope of scopes) {
    await useScope(page, scope);
    expect(await paint()).not.toBe(plain);
  }
});

test("the toggle is in the header of every page, and a choice carries to the next", async ({
  page,
}) => {
  await page.goto("/");
  await setScheme(page, "light");
  for (const path of ["/contracting/", "/pixelslash/", "/ui/tabs/"]) {
    await page.goto(path);
    await expect(toggle(page)).toHaveAccessibleName("Switch to dark theme");
    await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  }
});

test("/pixelslash/ shows the Playwright card under both schemes, and its code fits at 375px", async ({
  page,
}) => {
  await page.goto("/pixelslash/");
  const card = page.getByRole("article", { name: "Playwright tests you already have" });
  for (const scheme of ["dark", "light"] as const) {
    await setScheme(page, scheme);
    await expect(card).toBeVisible();
    await expect(card.getByText("npm i -D @hackcove/pixelslash-playwright")).toBeVisible();
  }
  await page.setViewportSize({ width: 375, height: 900 });
  const clipped = await card
    .locator("pre")
    .evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
  expect(clipped, "code in the Playwright card that scrolls sideways").toBe(0);
});

const middle = (box?: { top: number; height: number }) => (box?.top ?? 0) + (box?.height ?? 0) / 2;

// One test per page, never one test looping over them: a slow page cannot spend the next page's
// budget, and a failure names the page.
const phonePaths = [...new Set(everyPage)];

test.describe("at 375px the header is one row", () => {
  for (const path of phonePaths) {
    test(`${path}: no sideways scroll, the toggle inside the viewport, beside the brand`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(path);
      await toggle(page).waitFor();
      const { overflow, button, brand } = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        button: document
          .querySelector("header button:has([data-scheme-name])")
          ?.getBoundingClientRect(),
        brand: document.querySelector("header a[href='/']")?.getBoundingClientRect(),
      }));
      expect(overflow, `${path}: horizontal overflow`).toBe(0);
      expect(button?.right ?? 0, `${path}: toggle right edge`).toBeLessThanOrEqual(375);
      expect(Math.abs(middle(button) - middle(brand)), `${path}: toggle beside brand`).toBeLessThan(
        16,
      );
    });
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

  test.describe(`at ${width}px no example's code is clipped`, () => {
    for (const { path } of pages) {
      test(`${path}: no example's code is clipped`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const clipped = await page
          .locator("main pre")
          .evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
        expect(clipped, `${path}: code that scrolls sideways`).toBe(0);
      });
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

test("the logo ink and halo are the same fixed blue under both schemes' scope classes", async ({
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
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(page, scheme);
    await expect.poll(() => scopeClasses(page)).toEqual([schemeScope[scheme]]);
    expect(await colours()).toEqual(["rgb(79, 134, 247)", "rgb(79, 134, 247)"]);
  }
});

// Every card on the /ui/ index page carries its icon, in each scheme the site flips. The
// themes are a table, not cards: its own test follows.
const iconCards = [{ path: "/ui/", region: "Components", count: componentSections.length }];

for (const { path, region, count } of iconCards) {
  test(`${path}: every card in ${region} has its icon, in both schemes`, async ({ page }) => {
    await page.goto(path);
    const cards = page.getByRole("region", { name: region, exact: true }).getByRole("article");
    await expect(cards).toHaveCount(count);
    for (const scheme of ["light", "dark"] as const) {
      await setScheme(page, scheme);
      for (const card of await cards.all()) {
        await expect(card.locator("svg")).toHaveCount(1);
        await expect(card.locator("svg")).toBeVisible();
      }
    }
  });
}
