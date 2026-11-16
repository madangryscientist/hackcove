import { expect, test } from "@playwright/test";
import { componentPages } from "../src/content/components/index";

test("Overview's Use instead table lists each sibling page and links to it", async ({ page }) => {
  const withSiblings = componentPages.find((p) => (p.siblings ?? []).length > 0);
  const without = componentPages.find((p) => (p.siblings ?? []).length === 0);
  if (withSiblings === undefined || without === undefined) {
    throw new Error("expected pages both with and without siblings");
  }
  const siblings = withSiblings.siblings ?? [];
  await page.goto(`/ui/${withSiblings.slug}/`);
  const table = page
    .getByRole("region", { name: "Overview" })
    .getByRole("table", { name: "Use instead" });
  await expect(table.getByRole("rowgroup").last().getByRole("row")).toHaveCount(siblings.length);
  const [first] = siblings;
  if (first === undefined) throw new Error("no sibling");
  const target = componentPages.find((p) => p.slug === first.slug);
  if (target === undefined) throw new Error(`no page ${first.slug}`);
  await table.getByRole("link", { name: target.name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/ui/${first.slug}/$`));
  // The examples on a page draw headings of their own, so find the page's by its name.
  await expect(
    page.getByRole("heading", { level: 1, name: target.name, exact: true }),
  ).toBeVisible();

  await page.goto(`/ui/${without.slug}/`);
  await expect(
    page.getByRole("region", { name: "Overview" }).getByRole("table", { name: "Use instead" }),
  ).toHaveCount(0);
});
