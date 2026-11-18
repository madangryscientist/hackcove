import { expect, test, type Locator, type Page } from "@playwright/test";

// The docs body is static HTML that is never hydrated, so these clicks reach `copyScript`, not React.
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

/** The code examples on a docs page: every figure there is one (a preview, its code, a caption). */
const examples = (page: Page) => page.getByRole("figure");

/** After a copy: the copied label shows, the idle one hides, the name stays, the region says it. */
async function expectCopied(example: Locator): Promise<void> {
  const button = example.getByRole("button", { name: "Copy" });
  await expect(button.getByText("Copied", { exact: true })).toBeVisible();
  await expect(button.getByText("Copy", { exact: true })).toBeHidden();
  await expect(button).toHaveAccessibleName("Copy");
  await expect(example.getByRole("status")).toHaveText("Copied");
}

test("on /ui/button/ the first example's copy button copies its source and shows copied", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const example = examples(page).first();
  const button = example.getByRole("button", { name: "Copy" });
  await expect(button).toBeVisible();
  await expect(button.getByText("Copied", { exact: true })).toBeHidden();
  // The example's code block comes before its caption, which may hold inline code of its own.
  const source = await example.getByRole("code").first().textContent();
  expect(source?.length).toBeGreaterThan(0);
  await button.click();
  await expectCopied(example);
  expect(await clipboard(page)).toBe(source);
});

test("on /ui/button/ every code example has a named copy button reached by Tab, except Don't", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const count = await examples(page).count();
  const donts = await page
    .getByRole("region", { name: "Overview" })
    .getByText("Don't", { exact: true })
    .count();
  expect(count).toBeGreaterThan(donts);
  const buttons = examples(page).getByRole("button", { name: "Copy" });
  await expect(buttons).toHaveCount(count - donts);

  // Every element that takes focus is marked, then Tab walks the page until each copy button has
  // had it.
  await page.evaluate(() => {
    document.addEventListener("focusin", (event) => {
      if (event.target instanceof HTMLElement) event.target.dataset["focused"] = "";
    });
  });
  const reached = () =>
    buttons.evaluateAll(
      (all) =>
        all.filter((el) => el instanceof HTMLElement && el.dataset["focused"] !== undefined).length,
    );
  await expect(async () => {
    await page.keyboard.press("Tab");
    expect(await reached()).toBe(count - donts);
  }).toPass({ intervals: [0], timeout: 30_000 });
});
