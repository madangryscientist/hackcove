import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { sitePages } from "../test/pages";

/** WCAG 2.1 AA: the levels A and AA of WCAG 2.0 and of 2.1. */
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Desktop only: the phone project does not match this file. A first visit follows the browser's
// prefers-color-scheme, so each scheme is set on the context rather than with the toggle.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme });

    for (const path of sitePages) {
      test(`${path}: no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path);
        const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
        const found = violations.map(({ id, nodes }) => ({
          rule: id,
          elements: nodes.map(({ target, html }) => `${target.join(" ")}: ${html.slice(0, 160)}`),
        }));
        expect(found).toEqual([]);
      });
    }
  });
}
