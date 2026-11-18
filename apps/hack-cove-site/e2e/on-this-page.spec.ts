import { expect, test, type Page } from "@playwright/test";
import { componentPages } from "../src/content/components/index";

// The two ways around a component page: its own "On this page" list, and the previous and next links
// at its foot. Both are in the HTML the server builds, so the list is checked with scripts off.
const onThisPage = (page: Page) => page.getByRole("navigation", { name: "On this page" });

test("with JavaScript off, the On this page list is in the HTML and every link names an h2", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/ui/button/");
  const nav = onThisPage(page);
  await expect(nav).toBeVisible();
  const hrefs: string[] = await nav
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs).toEqual(["#overview", "#usage", "#accessibility", "#api"]);
  for (const href of hrefs) {
    await expect(page.locator(`h2[id="${href.slice(1)}"]`)).toHaveCount(1);
  }
  await context.close();
});

/** The component pages in the order the rail lists them: its own links, Getting started aside. */
async function railOrder(page: Page): Promise<string[]> {
  const hrefs: string[] = await page
    .getByRole("complementary", { name: "All components" })
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  return hrefs.filter((href) => /^\/ui\/[^/]+\/$/.test(href));
}

test("the first page has no Previous and the last no Next, and Next follows the rail", async ({
  page,
}) => {
  const rail = await (async () => {
    await page.goto("/ui/button/");
    return railOrder(page);
  })();
  expect(rail.length).toBe(componentPages.length);

  await page.goto(rail[0] ?? "");
  await expect(page.getByRole("link", { name: /^Previous:/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Next:/ })).toHaveAttribute("href", rail[1] ?? "");

  await page.goto(rail.at(-1) ?? "");
  await expect(page.getByRole("link", { name: /^Next:/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Previous:/ })).toHaveAttribute(
    "href",
    rail.at(-2) ?? "",
  );

  const at = Math.floor(rail.length / 2);
  await page.goto(rail[at] ?? "");
  await expect(page.getByRole("link", { name: /^Previous:/ })).toHaveAttribute(
    "href",
    rail[at - 1] ?? "",
  );
  await expect(page.getByRole("link", { name: /^Next:/ })).toHaveAttribute(
    "href",
    rail[at + 1] ?? "",
  );
});
