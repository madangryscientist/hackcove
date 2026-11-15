# @hackcove/oxlint-testing

A shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html) config and plugin for UI tests:
Playwright specs, Testing Library and Vitest tests, and Playwright configs. It enforces the parts of
our UI testing rules (the `ob-ui-testing` rules every message names) that a linter can see:

- **Rule 1: Find elements the way a user does.** By role and accessible name, never a selector string, a
   raw locator or a DOM walk. The one exception is the app's ready marker, `html[data-hydrated]`.
- **Rule 2: Wait on a state, never on a clock.** No fixed sleeps, no `networkidle`.
- **Rule 5: Assert what the user sees.** One `if` in a test is two tests.
- **Rule 7: Behaviour in tests, look in PixelSlash.** No assertion on a class, a style, a computed style,
   a bounding box or a screenshot. The look is the visual check's.
- **Rule 8: One config shape.** `retries: 0`, `reuseExistingServer: false`, `trace: "retain-on-failure"`,
   and no bare, focused or ticketless skip.

It is about tests only. Lint rules for using `@hackcove/ui-react` itself are a separate package, and
a repo can extend either without the other.

Status: `0.x`. License: MIT.

## Install

```sh
bun add -d -E @hackcove/oxlint-testing oxlint@1.89.0 eslint-plugin-playwright@2.12.2 eslint-plugin-testing-library@7.16.2
```

The three peers are exact versions. oxlint's `jsPlugins`, which loads the ESLint plugins and this
package's own, is alpha and not under semver, so the versions move together, in a release of this
package.

## Use

Extend the config from the repo's `.oxlintrc.json`. `extends` takes a path, relative to the file:

```json
{
  "extends": ["./node_modules/@hackcove/oxlint-testing/.oxlintrc.json"]
}
```

Every rule is scoped by a glob (below), so the config changes nothing outside test files, and the
repo's own plugins, categories and rules stay as they are.

A line that is a real exception (a `setTimeout` inside a stub server, say) says why on the line
above:

```ts
// oxlint-disable-next-line no-restricted-globals -- the stub answers late on purpose, HC-123
setTimeout(reply, 50);
```

## The globs

| Files | What they are | Rules |
| --- | --- | --- |
| `**/*.test.{ts,tsx,js,jsx,mjs}` | DOM and unit tests (Vitest, Testing Library) | Vitest, Testing Library, `ui-testing/no-node-access`, `ui-testing/no-style-assertions`, sleeps, style reads |
| `**/*.built.test.{ts,tsx,js,jsx,mjs}` | checks of built output (a loop over parsed `dist/` pages) | as a DOM test, less the two that flag reading HTML as data |
| `**/e2e/**`, `**/smoke/**`, `**/*.spec.{ts,tsx,js,mjs}` | Playwright e2e and smoke specs | Playwright, `ui-testing/no-selector-actions`, `no-style-assertions`, `skip-names-ticket`, sleeps, style reads |
| `**/playwright.config.*`, `**/playwright.*.config.*` | Playwright configs | `ui-testing/config-shape` |

A check that parses built HTML (meta tags, `href`, `id`) reads it as data, not as a user would, so
its file is named `*.built.test.ts`. That glob turns off `vitest/no-conditional-in-test` (a parse
branches) and `ui-testing/no-node-access` (it queries a parsed document). `vitest/require-mock-type-parameters` is off in every test: it flags every
`vi.fn()`.

## The rules

The `ui-testing` rules are this package's plugin (`plugin.js`). The rest are oxlint's own or come
from `eslint-plugin-playwright` and `eslint-plugin-testing-library`.

| Rule | Where | Reports | ob-ui-testing rule |
| --- | --- | --- | --- |
| `ui-testing/no-selector-actions` | e2e | `page.click('#x')`, `page.fill('.y', v)`, `page.$('a')`: an action or a read that takes a selector string | 1. Find elements the way a user does |
| `playwright/no-raw-locators` | e2e | `page.locator('.card')`; `html[data-hydrated]` is allowed | 1. Find elements the way a user does |
| `playwright/no-wait-for-selector` | e2e | `page.waitForSelector('#ready')` | 1 and 2 |
| `ui-testing/no-node-access` | DOM | `.parentElement`, `.closest(...)`, `document.querySelector(...)`, `getByRole(...).click()`, in a file that imports Testing Library directly or through a local module that re-exports it (`export { render, screen } from "@testing-library/react"`). Reading `document.activeElement` passes: where focus is, is what a keyboard test asserts | 1. Find elements the way a user does |
| `testing-library/no-container` | DOM | `container.querySelector(...)` | 1. Find elements the way a user does |
| `testing-library/prefer-screen-queries` | DOM | `view.getByText(...)` in place of `screen` | 1. Find elements the way a user does |
| `playwright/no-wait-for-timeout` | e2e | `page.waitForTimeout(500)` | 2. Wait on a state, never on a clock |
| `playwright/no-networkidle` | e2e | `waitForLoadState('networkidle')` | 2. Wait on a state, never on a clock |
| `no-restricted-globals` | DOM, e2e | `setTimeout`, `setInterval` (rule 2); `getComputedStyle` (rule 7) | 2 and 7 |
| `no-restricted-properties` | DOM, e2e | `Bun.sleep` (rule 2); `className`, `classList`, `window.getComputedStyle`, and in e2e `boundingBox` (rule 7) | 2 and 7 |
| `testing-library/no-wait-for-side-effects` | DOM | a render or an event inside `waitFor` | 2. Wait on a state, never on a clock |
| `vitest/no-conditional-in-test` | DOM | an `if`, ternary or `switch` in a test | 5. Assert what the user sees |
| `playwright/no-conditional-in-test`, `playwright/no-conditional-expect` | e2e | the same, in a spec | 5. Assert what the user sees |
| `ui-testing/no-style-assertions` | DOM, e2e | `toHaveAttribute('class')`, `getAttribute('style')`, `toHaveProperty('className')`, a `className` or `style` key in a `toMatchObject` or `toEqual` object | 7. Behaviour in tests, look in PixelSlash |
| `vitest/no-restricted-matchers`, `playwright/no-restricted-matchers` | DOM, e2e | `toHaveClass`, `toHaveStyle`, `toHaveCSS`, `toHaveScreenshot`, `toMatchScreenshot` | 7. Behaviour in tests, look in PixelSlash |
| `vitest/no-focused-tests`, `playwright/no-focused-test` | DOM, e2e | `test.only`, `describe.only` | 8. One config shape |
| `vitest/no-disabled-tests`, `playwright/no-skipped-test` | DOM, e2e | a bare skip or fixme (`test.skip('title', fn)`, `test.skip()`); a conditional skip with a reason passes on to the next rule | 8. One config shape |
| `ui-testing/skip-names-ticket` | e2e | `test.skip(cond, reason)`, `test.fixme(...)`, `test.fail(...)` whose reason (or, for `test.fail('title', fn)`, title) names no ticket such as `FS-12` | 8. One config shape |
| `ui-testing/config-shape` | Playwright configs | `retries` other than `0`, `reuseExistingServer` other than `false`, `trace` other than `"retain-on-failure"`, or no `trace` at all (it defaults to `"off"`) | 8. One config shape |

`config-shape` reads literal values: `retries: process.env.CI ? 2 : 0` is reported, as it should be.

## What lint cannot see

The rest of the rules need a reviewer or the run itself:

- **Every test owns its world (rule 3):** a fresh, migrated store per run, and each test creating the
  data it reads. Lint cannot tell seeded data from a shared developer database.
- **The network ends at localhost (rule 4):** every third party stubbed. A real request is a runtime
  fact.
- **A test passes alone and in any order.** Only running it that way shows it.
- **Presence inventories (rule 7):** a test that lists what is on a page and checks each is visible,
  with no action and no outcome. Each line of it is a legal assertion.
- **A class or style inside a string:** `expect(html).toContain('class="sr-only"')` on rendered
  markup is a string match to a linter.
- **Layering:** whether a check belongs in a unit test, an e2e spec or a visual shot.
- **Where it runs (rule 9):** that the e2e suite runs in CI on every pull request.

## In this repo: report first, then enforced

Turning the config on for a project with old violations would fail its `lint` task, so the repo
counts them first. `bun run lint:testing` (`scripts/testing-lint-report.ts` at the root) runs this
config, with its own globs, over each project that does not enforce it yet, prints the count per
project and per rule, and exits 0. It is not part of the gate.

A project switches to enforced once its count is 0:

1. Give the project its own `.oxlintrc.json`, extending the root's config and this one:
   `{ "extends": ["../../.oxlintrc.json", "../../packages/oxlint-testing/.oxlintrc.json"] }`.
2. Point its `lint` script at it: `oxlint -c .oxlintrc.json --type-aware --deny-warnings`.
3. Remove the project from the report's list in `scripts/testing-lint-report.ts`.

## Developing

```sh
bunx moon run oxlint-testing:test         # the fixture suite
bunx moon run oxlint-testing:pack-check   # the tarball's files, and a consumer that installs it
```

`fixtures/bad/` holds planted violations, each line a rule must report ending with
`// expect: <rule>` (or carrying it alone on the line below); `fixtures/good/` holds code no rule may report.
The suite runs the pinned oxlint with this config over both, and fails on a marked line that is not
reported, on anything reported that is not marked, and on a rule the config turns on that no fixture
plants. A new rule adds its bad lines in the same change.
