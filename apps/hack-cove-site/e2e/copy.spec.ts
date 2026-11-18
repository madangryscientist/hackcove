import { expect, test } from "@playwright/test";

// The docs body is static HTML that is never hydrated, so these clicks reach `copyScript`, not React.
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = (page: import("@playwright/test").Page) =>
  page.evaluate(() => navigator.clipboard.readText());

/** After a copy: the copied label shows, the idle one hides, the name stays, the region says it. */
async function expectCopied(button: import("@playwright/test").Locator): Promise<void> {
  await expect(button.getByText("Copied", { exact: true })).toBeVisible();
  await expect(button.getByText("Copy", { exact: true })).toBeHidden();
  await expect(button).toHaveAccessibleName("Copy");
  await expect(button.locator("+ [data-copy-status]")).toHaveText("Copied");
}

test("on /ui/button/ the first example's copy button copies its source and shows copied", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const figure = page.locator("figure", { has: page.locator("pre") }).first();
  const button = figure.locator("button[data-copy-text]");
  await expect(button).toHaveAccessibleName("Copy");
  await expect(button.getByText("Copied", { exact: true })).toBeHidden();
  const source = await figure.locator("pre").evaluate((el) => el.textContent ?? "");
  expect(source.length).toBeGreaterThan(0);
  await button.click();
  await expectCopied(button);
  expect(await clipboard(page)).toBe(source);
});

test("on /ui/button/ every code example has a named copy button reached by Tab, except Don't", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const examples = await page.locator("figure", { has: page.locator("pre") }).count();
  const donts = await page
    .getByRole("region", { name: "Overview" })
    .getByText("Don't", { exact: true })
    .count();
  expect(examples).toBeGreaterThan(donts);
  const buttons = page.locator("figure").getByRole("button", { name: "Copy" });
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
