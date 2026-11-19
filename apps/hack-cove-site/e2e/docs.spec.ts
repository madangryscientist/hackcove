import { expect, test } from "@playwright/test";
import { componentPages } from "../../../packages/ui-react/docs/components/index";
import { must } from "../test/must";
import { hydrated, pages, schemeScope, scopeClasses, setScheme, toggle } from "./scheme";

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

test("there is no theme Select in the header: the toggle is the only control", async ({ page }) => {
  await page.goto("/ui/");
  await hydrated(page);
  // A native select is a combobox (a listbox when it shows several rows): neither is on the page.
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("listbox")).toHaveCount(0);
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

test("a first visit follows prefers-color-scheme", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/contracting/");
  await expect.poll(() => scopeClasses(page)).toEqual([schemeScope.light]);
  await hydrated(page);
  await expect(toggle(page)).toHaveAccessibleName("Switch to dark theme");
  await context.close();
});

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

/** A rule as it reads on the page: `InlineCode` renders the backticked parts as code, without the backticks. */
const visible = (rule: string) => rule.replaceAll("`", "");

const withDont = must(
  componentPages.find((p) => (p.usage.dont ?? []).length > 0),
  "a component page with a usage.dont rule",
);

test("Usage lists the do rules and the dont rules as two named lists", async ({ page }) => {
  const { slug, usage } = withDont;
  await page.goto(`/ui/${slug}/`);
  const region = page.getByRole("region", { name: "Usage" });
  const lists = {
    do: region.getByRole("list", { name: "Do", exact: true }),
    dont: region.getByRole("list", { name: "Don't", exact: true }),
  };
  await expect(lists.do.getByRole("listitem")).toHaveText(usage.do.map(visible));
  await expect(lists.dont.getByRole("listitem")).toHaveText((usage.dont ?? []).map(visible));

  await page.goto("/ui/button/");
  const button = page.getByRole("region", { name: "Usage" });
  await expect(button.getByRole("list", { name: "Do", exact: true })).toBeVisible();
  await expect(button.getByRole("list", { name: "Don't", exact: true })).toHaveCount(0);
});
