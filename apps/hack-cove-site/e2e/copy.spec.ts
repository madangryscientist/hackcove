import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";

// The docs body is static HTML that is never hydrated, so these clicks reach `copyScript`, not React.
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = (page: import("@playwright/test").Page) =>
  page.evaluate(() => navigator.clipboard.readText());

/** After a copy: the copied label shows, the idle one hides, the name stays, the region says it. */
async function expectCopied(button: import("@playwright/test").Locator): Promise<void> {
  await expect(button.getByText("copied", { exact: true })).toBeVisible();
  await expect(button.getByText("copy", { exact: true })).toBeHidden();
  await expect(button).toHaveAccessibleName("copy");
  await expect(button.locator("+ [data-copy-status]")).toHaveText("copied");
}

test("on /ui/button/ the first example's copy button copies its source and shows copied, twice", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const figure = page.locator("figure", { has: page.locator("pre") }).first();
  const button = figure.locator("button[data-copy-text]");
  await expect(button).toHaveAccessibleName("copy");
  await expect(button.getByText("copied", { exact: true })).toBeHidden();
  const source = await figure.locator("pre").evaluate((el) => el.textContent ?? "");
  expect(source.length).toBeGreaterThan(0);
  await button.click();
  await expectCopied(button);
  expect(await clipboard(page)).toBe(source);
  // The second copy copies again and puts a new node in the region, so it is announced again.
  await button.evaluate((el) => {
    const text = el.nextElementSibling?.firstChild;
    if (text) Object.assign(text, { old: true });
  });
  await page.evaluate(() => navigator.clipboard.writeText(""));
  await button.click();
  await expect.poll(() => clipboard(page)).toBe(source);
  await expect
    .poll(() =>
      button.evaluate((el) => {
        const text = el.nextElementSibling?.firstChild;
        return text !== null && text !== undefined && !("old" in text);
      }),
    )
    .toBe(true);
  await expectCopied(button);
});

test("on /ui/ the install snippet's copy button copies its command", async ({ page }) => {
  await page.goto("/ui/");
  const step = site.ui.install.steps[0];
  if (step?.code === undefined) throw new Error("the first install step has no code");
  const button = page
    .locator("figure", { hasText: [step.code].flat().join("\n") })
    .locator("button[data-copy-text]");
  await button.click();
  await expectCopied(button);
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
