# UISlash facts

Checked against main at 6c4c2a39 on 2026-11-18.

## What it is
UI components your agents can't get wrong: React components and the themes made for them, which a site is built from with props alone, never its own CSS. Early, every package at version 0.x.

## Today
- `react-components`: `@hackcove/ui-react` is installable from npm (version 0.11.2).
- `themes-package`: `@hackcove/themes` is installable from npm (version 0.3.1), one CSS file per theme.
- `seven-themes`: the themes package holds seven themes, four light and three dark (`themes/*.css`).
- `theme-reskins-all`: every theme remaps every colour utility the components use, so switching theme changes the whole site with no component change (`themes/themes.test.ts`).
- `contrast-checked`: every theme is tested against the WCAG AA contrast contract (`themes/themes.test.ts`).
- `no-styling-escape`: no exported component accepts `className` or `style` (`packages/ui-react/src/noStyling.test.tsx`).
- `status-pages`: the components include whole pages for an error, not found, forbidden, maintenance and offline.
- `ui-review-workflow`: a reusable GitHub workflow checks a pull request that uses the components: a rule check that fails the pull request, and an advisory model review.
- `test-lint-config`: `@hackcove/oxlint-testing` is installable from npm (version 0.1.0), a shared oxlint config and plugin for UI tests.
- `component-docs`: the component docs and an `llms.txt` for agents are published at hack-cove.com/ui/.

## Planned
- `react-native`: a React Native package, `@hackcove/ui-react-native`, built natively; not built yet.

## Licence
- `licence`: open source under the MIT licence

## Where it runs
- `npm-install`: any React 19 app using Tailwind v4, installed from npm.
- `tested-in-chromium`: the end to end and visual tests run in Chromium only.
- `github-actions`: the UI review workflow runs on GitHub Actions.
- `docs-site`: https://hack-cove.com/ui/
