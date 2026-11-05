# hackcove

The Hack Cove design system: an opinionated, strict UI library that is fully integrated with its
theming. The components and the themes are designed together, and every theme remaps every palette
utility the components use, so switching theme reskins a whole site with no component change and
nothing to configure. It fixes the look and feel so agents reliably build good-looking sites; it is
not an extensible framework with every option in the world.

It is an Nx + Bun-workspaces monorepo. Every package here is published on its own and is on npm
under the `@hackcove` scope (MIT, all `0.x`).

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui-react` | `@hackcove/ui-react` | The React components: primitives, typography roles, a safe Markdown renderer. Written against Tailwind v4 utilities. No theme CSS. |
| `themes` | `@hackcove/themes` | Every theme, one CSS file each, remapping those utilities: `catppuccin-mocha.css` (dark, scope `.dark`), `catppuccin-latte.css` (light, scope `.latte`) and `thrifty-paper.css` (light, scope `.thrifty-paper`). |
| `apps/storybook` | (private) | Storybook for the components, with a toolbar theme switcher that lists every CSS file in `themes/`. |
| `apps/hack-cove-site` | (private) | The hack-cove.com website (Astro), built on the workspace components and the Mocha theme. |

Each theme scopes under its own class, which goes on `<html>`: `.dark` for Mocha,
`.latte` for Latte, `.thrifty-paper` for Thrifty Paper. Without a theme the components render in Tailwind's own
default colours, a plain light look: it works, but it is only what a theme remaps, not a look Hack
Cove designs or checks, so Storybook and the visual check list the themes and nothing else.

## Use it

```sh
bun add @hackcove/ui-react @hackcove/themes
# peers: react >= 18, react-dom >= 18, tailwindcss ^4
# optional type peers: @types/react, @types/react-dom (install them in a TypeScript app)
```

```css
@import "tailwindcss";
@import "@hackcove/themes/catppuccin-mocha.css";

/* The components use Tailwind utilities, and Tailwind skips node_modules, so point it at the
   package's build. The path is relative to this stylesheet. */
@source "../node_modules/@hackcove/ui-react/dist";
```

Put `class="dark"` on `<html>`. The theme declares the class-based `dark` variant and remaps the
slate/colour utilities to Mocha tokens under `.dark`.

```tsx
import { Card, PageHeading, Pill, Text } from "@hackcove/ui-react";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Text>Two things shipped.</Text> <Pill tone="emerald">ok</Pill>
  </Card>
);
```

`@hackcove/ui-react` has one runtime dependency, `react-aria-components` (with `@internationalized/date`),
for the date picker. Any other dependency is a human decision.

### Coming from `@hackcove/ui`?

The package was renamed to `@hackcove/ui-react` in 0.8.0 (the React Native package that comes later is
`@hackcove/ui-react-native`). It is the same components under a new name, with no alias package and no
re-export, so the old name stays at 0.7.1. To move:

1. Swap the dependency: `bun remove @hackcove/ui && bun add @hackcove/ui-react`.
2. Find and replace the import specifier `"@hackcove/ui"` with `"@hackcove/ui-react"`.
3. Find and replace the `@source` path `node_modules/@hackcove/ui/dist` with
   `node_modules/@hackcove/ui-react/dist`.

## Browser support

Hack Cove supports the web platform as of the [Baseline digest of August 2026](https://web.dev/blog/baseline-digest-aug-2026).
Anything Baseline newly available by then may be used; anything newer goes in only as
feature-detected progressive enhancement (the page fade's `startViewTransition` is one). In
practice that means the current evergreen browsers: Chrome and Edge 131+, Firefox 143+, and Safari
(macOS and iOS) 18.4+ (`browserslist` in the root `package.json`; the floor is set by
`::details-content`, and Tailwind v4's own floor is lower). There is no support for older
browsers and no polyfills. The e2e runs every spec in Chromium, Firefox and WebKit; the PixelSlash
visual check is Chromium-only.

## No styling props

No component takes `className` or `style`, and the HTML props they spread leave both out
(`data-*`, `aria-*` and event props still pass). The look is fixed; a different one is a prop or
variant on the component, or it does not exist. Consumers compose the parts and write no styling,
which is what lets a theme reskin a whole site.

## Layout

`AppShell` paints the page canvas and sets the type face and ink (a theme remaps the canvas and owns
the font stacks), so an app ships no page-background or font CSS. It gives every page one content edge: a sticky one-row header, then main, both inside
`Container` (`max-w-6xl`, `px-4 sm:px-6`, defined there and nowhere else). Put `appShellRootClassFor(scheme)`
on your `<html>` so the scrollbar is always reserved and centred content does not shift between a
short and a long page; no component touches `<html>`. Pages never set their own width or outer
padding: they start with `PageHeader` and space their blocks with `Stack` (`xs` between lines of text,
`sm` inside a group, `md` between blocks, `lg` between groups, `xl` between a page's top-level
blocks). A text page uses `ProseLayout`, or
`Stack width="narrow"`, for its reading measure. See
[`packages/ui-react/README.md`](packages/ui-react/README.md#layout).

The page-layout stories in Storybook (`Page layouts/…`, and `Layout/AppShell`) are checked at 375, 768 and 1280 px by `e2e/layout.spec.ts`: the
page title must start at the logo's x, the same x on every one of them (found by title, so a
new one needs no test edit). `CenteredLayout`, `SidebarLayout` and `FullBleedLayout` are the
exceptions (a narrow card, a rail beside the canvas, no page padding) and are asserted on their own
terms in the same file. `SidebarLayout`'s rail starts at the logo's x, so it keeps the edge.
`FullBleedLayout` breaks it on purpose from `lg` up: an edge-to-edge viewer needs the viewport's
edges (at 1280 px the logo and the other layouts are at x=88, the viewer at 0), so the header stays
the constant and an app gives a whole section one layout. The screenshot-based visual check (see
[`CONTRIBUTING.md`](CONTRIBUTING.md#the-visual-check)) shoots desktop (1280) only; for the narrow widths, pick
Phone (375) or Tablet (768) from Storybook's viewport toolbar.

A header or subnav row that is wider than the viewport scrolls sideways, and says so: the edge with
more content past it fades out (a mask, so it follows any theme), and the fade goes once the row is
scrolled to that end. A row that fits is untouched. Story: `Layout/AppShell › OverflowingSubnav`.

The header row is laid out by slots, so an app writes no wrapper or `className` there: `brand`,
`nav` and `controls` (`header` stays as a free node). `hideChromeInPrint` is opt-in: the header and
footer are hidden on paper and main drops its padding, so the page margin is the app's `@page`.
`AppShellBrand` makes the logo and the name one link (a router link through `render`), nothing in
`controls` shrinks, and `appShellRootClassFor(scheme, schemes?)` gives `<html>` its scheme class and
the scrollbar class together.
Stories: `Layout/AppShell › HeaderSlots`, `LinkedBrand`, `RouterBrand` and `HiddenInPrint`.

## Dates

`DateField` is a segmented DD/MM/YYYY field; `calendar` adds a calendar popover. Values are `CalendarDate`s; `toISODate` and `fromISODate` convert to and from `"1990-05-17"`.
See [`packages/ui-react/README.md`](packages/ui-react/README.md#dates).

## Light and dark

`@hackcove/ui-react` ships the switch for the `.dark` class: inline `colourSchemeScript` in `<head>` (it
applies the stored choice, else the system preference, before first paint), drop the hard-coded
`class="dark"` from `<html>`, and place `<ColourSchemeToggle />` in the header. Two states, no
provider. See [`packages/ui-react/README.md`](packages/ui-react/README.md#light-and-dark).

## How to add a theme

A theme is one CSS file in the `themes/` package, and its file name is its id:

1. Copy a file to `themes/<id>.css`. The id names the switcher entry and the visual shots, so it never
   changes once it has baselines.
2. Edit it. The contract: pick the theme's scope class and make its first top-level rule
   `.<scope> { color-scheme: …; }` (Storybook and the e2e read the scope from that rule), remap the
   utilities `@hackcove/ui-react` uses under `.<scope>`, and do not import Tailwind (the consumer does).
   A dark theme also declares `@custom-variant dark (&:where(.<scope>, .<scope> *));`. The colours
   must also clear WCAG AA: `themes/themes.test.ts` runs a contrast check
   (`packages/themes-shared/src/contrastRules.ts`) that measures every ink, link, accent and tone
   pairing in `palette.json` on every surface it sits on (4.5:1 for text, 3:1 for the edge of a
   control, a focus ring or a chart mark). A failure names the pair, both colours, the ratio and the
   bar. Decorative and inactive pairings (hairline dividers, the dimming veil, dimmed text) are
   exempt by role, with the reason, in the same file.
3. Add a row to the table in `themes/README.md`, and any upstream licence text to `themes/NOTICE`.
4. `bunx nx run themes:test`. `themes.test.ts` reads every CSS file there and applies the contract
   to each, and checks the package carries it.

There is nothing else to register: the package's `exports` and `files` are globs, and Storybook finds
`themes/*.css` on its own, so the new theme is in the toolbar the next time it starts. It also
appears as a panel in **Overview / All themes**, with no code edit.

## UI review

A pull request in a repo that uses Hack Cove can be checked for building its UI the Hack Cove way.
Add this workflow to the repo:

```yaml
on: pull_request
jobs:
  ui-review:
    permissions: { contents: read, pull-requests: write }
    uses: madangryscientist/hackcove/.github/workflows/ui-review.yml@main
    secrets: inherit
```

It runs two layers on the lines the pull request adds:

- **Rules (no model).** Fails the check with a `file:line` annotation on a new CSS file or
  `<style>` block, a raw palette utility (`bg-slate-800`), a `dark:` variant, a `className` or
  `style` on an `@hackcove/ui-react` component, and a local component that duplicates a Hack Cove export.
  The palette and the export list are read from `@hackcove/ui-react` itself, never copied.
- **Model review (advisory).** An OpenCode Zen model (`opencode/deepseek-v4.1-flash`) reads the diff
  against the Hack Cove purpose and the generated `/ui/llms.txt`, and posts inline comments plus one
  summary. A part Hack Cove lacks is reported as "ask hackcove for X", never "build it locally". Its
  findings are advisory and never fail the pull request. A review that did not happen does: if the
  model run crashes or times out, the reply cannot be parsed, or the component reference or the
  comments cannot be had, the step prints an error, writes a step summary and goes red. It is
  skipped, and green, only when there is no `OPENCODE_API_KEY`, the model account is out of credits
  (a warning says so), or no app file changed. The diff is
  sent to OpenCode Zen. A large pull request is sent within a size limit (60,000 characters of
  diff): generated files (`props.json`, lockfiles, snapshots, `dist`, minified files) are left
  out, then source files and the largest additions are taken whole until it is full. What was
  left out is named in the step summary and in the pull request comment, and the check stays
  green; a model run that crashes or times out is still red.

What it needs:

| Needs | For |
| --- | --- |
| `OPENCODE_API_KEY` secret | The model review. Without it that layer is skipped with a notice; the rules still run. |
| `HACKCOVE_READ_TOKEN` secret | Reading this repository's tools while it is private (a fine-grained token with read access to contents). |
| `pull-requests: write` permission | Posting the comments. |

Inputs: `paths` (globs of the app code, one per line, `!` excludes; the default is every source,
markup and style file outside `node_modules` and `dist`), `hackcove-ref`, `build-rubric`
(build `llms.txt` from the checkout instead of fetching `llms-url`). A fork's pull request has no
secrets, so only the rules run on it.

Locally, `tools/ui-review` is dev tooling only (no published package depends on it):

```bash
bun tools/ui-review/src/check.ts --base origin/main --hackcove .            # the rules
bun tools/ui-review/src/review.ts --base origin/main --hackcove . \
  --llms apps/hack-cove-site/dist/ui/llms.txt --dry-run                     # prints the prompt, sends nothing
```

## Publish

Releases are change-driven: `nx release` reads the conventional commits since each package's last
tag, bumps only the packages that changed, and publishes through npm trusted publishing from a
manual GitHub Actions workflow. Nothing publishes on a push. The maintainer notes are in
[`docs/releasing.md`](docs/releasing.md); the commit format it reads is in
[`CONTRIBUTING.md`](CONTRIBUTING.md#commit-messages).

## Develop

Everything goes through Nx:

```sh
bun install
bunx nx run-many -t typecheck lint test build   # the gate
bun run format:check                            # oxfmt, workspace-wide
bunx nx run-many -t pack-check                  # npm pack --dry-run per package; ui-react also typechecks its tarball in a consumer app
bunx nx e2e storybook                           # Playwright over the built Storybook, in Chromium, Firefox and WebKit (first time: bunx playwright install chromium firefox webkit)
bunx nx e2e hack-cove-site                      # Playwright over the built site: the /ui/ pages under every theme
bunx nx run storybook:storybook                 # http://localhost:6006
bunx nx dev hack-cove-site                      # the website, http://localhost:4321
```

Contributing? Start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

Try an unpublished change in a consumer checkout: run `bun link` once inside `packages/ui-react` and
`themes`, then `bun link @hackcove/ui-react` and `bun link @hackcove/themes` in the consumer. Consumers
install the published `0.x` from npm, so the link is only for checking a change before it is
published. Rebuild `packages/ui-react` (`bunx nx build ui-react`) after a change; a linked consumer reads its `dist/`.
