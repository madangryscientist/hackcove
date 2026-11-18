import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { shardPages } from "./shard";

/** WCAG 2.1 AA: the levels A and AA of WCAG 2.0 and of 2.1. */
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Known axe findings, each excluded on its own page only, with the ticket that fixes it. Every other
 * rule still runs on that page, and the rule still runs on every other page.
 */
const knownAxe: readonly { page: string; rule: string; ticket: string }[] = [];

// Desktop only: the phone project does not match this file. A first visit follows the browser's
// prefers-color-scheme, so each scheme is set on the context rather than with the toggle.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme });

    for (const path of shardPages()) {
      test(`${path}: no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path);
        const known = knownAxe.filter((entry) => entry.page === path).map((entry) => entry.rule);
        const { violations } = await new AxeBuilder({ page })
          .withTags(tags)
          .disableRules(known)
          .analyze();
        const found = violations.map(({ id, nodes }) => ({
          rule: id,
          elements: nodes.map(({ target, html }) => `${target.join(" ")}: ${html.slice(0, 160)}`),
        }));
        expect(found).toEqual([]);
      });
    }
  });
}
