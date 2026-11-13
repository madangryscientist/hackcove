import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";

// The docs body is static HTML that is never hydrated, so these clicks reach `copyScript`, not React.
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = (page: import("@playwright/test").Page) =>
  page.evaluate(() => navigator.clipboard.readText());

test("on /ui/button/ the first example's copy button copies its source and reads copied", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const figure = page.locator("figure", { has: page.locator("pre") }).first();
  // Found by its data, not its name: the name stops matching "copy" once the label reads "copied".
  const button = figure.locator("button[data-copy-text]");
  await expect(button).toHaveAccessibleName("copy");
  const source = await figure.locator("pre").evaluate((el) => el.textContent ?? "");
  expect(source.length).toBeGreaterThan(0);
  await button.click();
  await expect(button).toHaveText("copied");
  expect(await clipboard(page)).toBe(source);
  await expect(button).toHaveText("copy");
});

test("on /ui/ the install snippet's copy button copies its command", async ({ page }) => {
  await page.goto("/ui/");
  const step = site.ui.install.steps[0];
  if (step?.code === undefined) throw new Error("the first install step has no code");
  const button = page
    .locator("figure", { hasText: [step.code].flat().join("\n") })
    .locator("button[data-copy-text]");
  await button.click();
  await expect(button).toHaveText("copied");
  expect(await clipboard(page)).toBe([step.code].flat().join("\n"));
});

test("on /ui/button/ every code example has a named copy button reached by Tab, except Don't", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const examples = await page.locator("figure", { has: page.locator("pre") }).count();
  const donts = await page.getByText("Don't", { exact: true }).count();
  expect(examples).toBeGreaterThan(donts);
  const buttons = page.locator("figure").getByRole("button", { name: "copy" });
  await expect(buttons).toHaveCount(examples - donts);

  // Tab through the page and collect the copy buttons that take focus.
  const reached = new Set<string>();
  for (let i = 0; i < 400 && reached.size < examples - donts; i++) {
    await page.keyboard.press("Tab");
    const text = await page.evaluate(() => {
      const el = document.activeElement;
      return el instanceof HTMLElement && el.dataset.copyText !== undefined
        ? `${el.dataset.copyText}\u0000${[...document.querySelectorAll("[data-copy-text]")].indexOf(el)}`
        : null;
    });
    if (text !== null) reached.add(text);
  }
  expect(reached.size).toBe(examples - donts);
});
