import { expect, test } from "@playwright/test";
import { componentPages } from "../src/content/components/index";
import { must } from "../test/must";

const withSiblings = must(
  componentPages.find((p) => (p.siblings ?? []).length > 0),
  "a component page with siblings",
);
const without = must(
  componentPages.find((p) => (p.siblings ?? []).length === 0),
  "a component page without siblings",
);
const siblings = withSiblings.siblings ?? [];
const first = must(siblings[0], "a first sibling");
const target = must(
  componentPages.find((p) => p.slug === first.slug),
  `a page ${first.slug}`,
);

test("Overview's Use instead table lists each sibling page and links to it", async ({ page }) => {
  await page.goto(`/ui/${withSiblings.slug}/`);
  const table = page
    .getByRole("region", { name: "Overview" })
    .getByRole("table", { name: "Use instead" });
  await expect(table.getByRole("rowgroup").last().getByRole("row")).toHaveCount(siblings.length);
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
