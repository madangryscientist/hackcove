import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { sitePages } from "../test/pages";

/** WCAG 2.1 AA: the levels A and AA of WCAG 2.0 and of 2.1. */
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Known axe findings, each excluded on its own page only, with the ticket that fixes it. Every other
 * rule still runs on that page, and the rule still runs on every other page.
 */
// CodeBody's code strip takes its tab stop in the browser, and the docs content is not hydrated.
const knownAxe: readonly { page: string; rule: string; ticket: string }[] = [
  { page: "/ui/app-shell/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/body-text/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/bottom-sheet/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/breadcrumbs/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/bullet-list/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/card/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/card-grid/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/centered-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/chat-composer/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/chat-thread/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/checkbox/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/cluster/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/code/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/colour-scheme-toggle/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/copy-button/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/copy-line/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/date-field/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/date-range-picker/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/dialog/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/disclosure/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/docs-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/drawer/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/empty-state/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/field/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/fieldset/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/file-drop/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/form-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/form-row/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/icon/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/icon-button/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/image/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/input/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/lightbox/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/list-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/loading/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/markdown/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/media-tile/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/menu/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/meta-list/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/morph/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/navigation-progress/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/outline-region/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/page-fade/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/page-header/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/progress-bar/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/prose-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/scroll-strip/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/segmented-control/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/sidebar-layout/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/side-column/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/site-search/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/sortable-list/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/split-bar/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/stack/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/stat-tile/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/status-pages/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/steps/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/sticky-bar/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/switch/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/table/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/tabs/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/textarea/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/text-link/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/timeline/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/toast/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/trend-chart/", rule: "scrollable-region-focusable", ticket: "HC-500" },
  { page: "/ui/video/", rule: "scrollable-region-focusable", ticket: "HC-500" },
];

// Desktop only: the phone project does not match this file. A first visit follows the browser's
// prefers-color-scheme, so each scheme is set on the context rather than with the toggle.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme });

    for (const path of sitePages) {
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
