# hackcove

The Hack Cove design system, as an Nx + Bun-workspaces monorepo. Every package here is published
on its own and is on npm under the `@hackcove` scope (MIT, all `0.x`).

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui` | `@hackcove/ui` | The React components: primitives, typography roles, a safe Markdown renderer. Written against Tailwind v4 utilities. No theme CSS. |
| `themes/catppuccin-mocha` | `@hackcove/theme-catppuccin-mocha` | The Catppuccin Mocha dark theme: one `theme.css` that remaps those utilities under `.dark`. |
| `themes/thrifty-paper` | `@hackcove/theme-thrifty-paper` | The Thrifty Paper light theme (cream paper, ink text, clay accent): one `theme.css` that remaps those utilities under `.thrifty-paper`. |
| `apps/storybook` | (private) | Storybook for the components, with a toolbar theme switcher that lists every folder under `themes/`. |

Each theme scopes under its own class, which goes on `<html>`: `.dark` for Mocha,
`.thrifty-paper` for Thrifty Paper. With no theme, the look is the components' own default Tailwind
classes; Storybook's `default` choice shows it.

## Use it

```sh
bun add @hackcove/ui @hackcove/theme-catppuccin-mocha
# peers: react >= 18, react-dom >= 18, tailwindcss ^4
```

```css
@import "tailwindcss";
@import "@hackcove/theme-catppuccin-mocha/theme.css";

/* The components use Tailwind utilities, and Tailwind skips node_modules, so point it at the
   package's build. The path is relative to this stylesheet. */
@source "../node_modules/@hackcove/ui/dist";
```

Put `class="dark"` on `<html>`. The theme declares the class-based `dark` variant and remaps the
slate/colour utilities to Mocha tokens under `.dark`.

```tsx
import { Body, Card, PageHeading, Pill } from "@hackcove/ui";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Body>Two things shipped.</Body> <Pill tone="emerald">ok</Pill>
  </Card>
);
```

`@hackcove/ui` has one runtime dependency, `react-aria-components` (with `@internationalized/date`),
for the date picker. Any other dependency is a human decision.

## Layout

`AppShell` gives every page one content edge: a sticky one-row header, then main, both inside
`Container` (`max-w-6xl`, `px-4 sm:px-6`, defined there and nowhere else). Put `appShellRootClass`
on your `<html>` so the scrollbar is always reserved and centred content does not shift between a
short and a long page; no component touches `<html>`. Pages never set their own width or outer
padding: they start with `PageHeader` and space their blocks with `Stack` (`sm` inside a group, `md`
between blocks, `lg` between groups). See
[`packages/ui/README.md`](packages/ui/README.md#layout).

The Layout stories in Storybook are checked at 375, 768 and 1280 px by `e2e/layout.spec.ts`: the
page title must start at the logo's x, the same x on every `Layout/…` story (found by title, so a
new one needs no test edit). `CenteredLayout`, `SidebarLayout` and `FullBleedLayout` are the
exceptions (a narrow card, a rail beside the canvas, no page padding) and are asserted on their own
terms in the same file. The last two break the edge on purpose, from `md` and `lg` up: a full-height
rail and an edge-to-edge viewer need the viewport's edges (at 1280 px the logo and the other
layouts are at x=88, the rail at 0, its canvas at 264), so the header stays the constant and an
app gives a whole section one layout. The screenshot-based visual check (see
[`CONTRIBUTING.md`](CONTRIBUTING.md#the-visual-check)) shoots desktop (1280) only; for the narrow widths, pick
Phone (375) or Tablet (768) from Storybook's viewport toolbar.

A header or subnav row that is wider than the viewport scrolls sideways, and says so: the edge with
more content past it fades out (a mask, so it follows any theme), and the fade goes once the row is
scrolled to that end. A row that fits is untouched. Story: `Layout/AppShell › OverflowingSubnav`.

## Dates

`DatePicker` is a segmented DD/MM/YYYY field with a calendar popover; `DateField` is the field on its
own. Values are `CalendarDate`s; `toISODate` and `fromISODate` convert to and from `"1990-05-17"`.
See [`packages/ui/README.md`](packages/ui/README.md#dates).

## Light and dark

`@hackcove/ui` ships the switch for the `.dark` class: inline `colourSchemeScript` in `<head>` (it
applies the stored choice, else the system preference, before first paint), drop the hard-coded
`class="dark"` from `<html>`, and place `<ColourSchemeToggle />` in the header. Two states, no
provider. See [`packages/ui/README.md`](packages/ui/README.md#light-and-dark).

## How to add a theme

A theme is a folder. Copy one, rename it, change the CSS:

```sh
cp -r themes/catppuccin-mocha themes/<name>
```

1. In `themes/<name>/package.json` set `name` to `@hackcove/theme-<name>`, `description`, and the
   Nx project name under `"nx"` to `theme-<name>`. Its scripts are folder-relative, so nothing else
   needs editing.
2. Edit `theme.css`. The contract: pick the theme's scope class and make its first top-level rule
   `.<scope> { color-scheme: …; }` (Storybook and the e2e read the scope from that rule), remap the
   utilities `@hackcove/ui` uses under `.<scope>`, and do not import Tailwind (the consumer does).
   A dark theme also declares `@custom-variant dark (&:where(.<scope>, .<scope> *));`.
3. Rewrite `README.md` for the new package; keep the MIT `LICENSE` and `"license": "MIT"`.
4. `bun install`, then `bunx nx run theme-<name>:test` (checks the name, exports, `files` list and
   the scope in the theme's own `theme.test.ts`; edit it to match your theme).

There is nothing else to register. Storybook finds `themes/*/theme.css` on its own, so the new
theme is in the toolbar the next time it starts. It also appears as a panel in **Overview / All themes**, with no code edit.

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
bunx nx run-many -t pack-check                  # npm pack --dry-run per package
bunx nx e2e storybook                           # Playwright over the built Storybook (first time: bunx playwright install chromium)
bunx nx run storybook:storybook                 # http://localhost:6006
```

Contributing? Start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

Try an unpublished change in a consumer checkout: run `bun link` once inside `packages/ui` and
each `themes/<name>`, then `bun link @hackcove/ui` (and the theme) in the consumer. Consumers
install the published `0.x` from npm, so the link is only for checking a change before it is
published. Rebuild `packages/ui` (`bunx nx build ui`) after a change; a linked consumer reads its `dist/`.
