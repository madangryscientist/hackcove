# Contributing to hackcove

Thanks for looking. This repo is the Hack Cove design system: React components (`@hackcove/ui`) and
one folder per theme (`@hackcove/theme-<name>`), each its own npm package, in an Nx +
Bun-workspaces monorepo. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). For
a security problem, follow [SECURITY.md](SECURITY.md) instead of opening an issue.

## Issues and pull requests

Bug reports, questions and proposals are welcome as GitHub issues, and so are pull requests. The
maintainer reads each issue and tracks the work in a private tracker; the issue stays open until
the fix has landed, and is closed then. A small fix needs no issue first: open the pull request.

## What belongs here

Hack Cove UI is an opinionated, strict UI library that is fully integrated with its theming: the
components and themes are designed together, and every theme remaps every palette utility the
components use. It fixes the look and feel so agents reliably build good-looking sites; it is not an
extensible framework. So the bar for a component ask is high. The default answer to a new prop,
variant or escape hatch is no, unless it is the one right way to meet a need that recurs across
consumers. We prefer fixed named choices to open styling, and consumers compose the parts without
restyling them. When you propose something, say what recurring need it serves.

## Setup

You need [Bun](https://bun.sh) and Node. Then:

```sh
bun install
bunx playwright install chromium   # once per machine, for the e2e
bunx nx run storybook:storybook    # http://localhost:6006
```

Open Storybook, flip the theme switcher in the toolbar, and read the stories. **Overview / All
themes** shows every component in every theme on one page.

## Layout

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui` | `@hackcove/ui` | The components. Builds to `dist/` (ESM + `.d.ts`). Peers: react, react-dom, tailwindcss v4. No theme CSS. |
| `themes/<name>` | `@hackcove/theme-<name>` | One `theme.css`, shipped as-is. |
| `apps/storybook` | (private) | Storybook and the Playwright e2e. |
| `packages/themes-shared` | (private) | How Storybook and the docs find the themes: the `themes/*/theme.css` glob and each theme's scope class. |
| `apps/hack-cove-site` | (private) | The hack-cove.com Astro site, including the `/ui/` component docs; run it with `bunx nx dev hack-cove-site` (http://localhost:4321). Its e2e is `bunx nx e2e hack-cove-site`. |

## The gate

A change is ready when all of this passes:

```sh
bun install
bunx nx run-many -t typecheck lint test build   # tsc strict · oxlint + check-slop · Vitest · dist + Storybook build
bun run format:check                            # oxfmt --check (`bun run format` fixes)
bunx nx run-many -t pack-check                  # npm pack --dry-run for every package
bunx nx e2e storybook                           # Playwright: builds Storybook, flips every theme
bunx nx e2e hack-cove-site                      # Playwright: builds the site, flips every theme on the /ui/ pages
```

`bunx nx affected -t <target>` runs just what changed. Lint rules are all errors: fix the code, do
not disable a rule.

## Rules of the repo

1. **`@hackcove/ui` carries no theme.** Components use stock Tailwind utilities (`bg-white`,
   `text-slate-900`, …) and never a `dark:` variant or a palette colour. A theme is the only place
   a palette lives; it remaps those utilities under its own scope class. The colour utilities a
   component may use are listed in `packages/ui/palette.json`. A new one is a palette change: add
   it there and remap it in every theme in the same change.
2. **A theme is a folder and nothing else registers it.** No theme name appears in code.
3. **Almost no runtime dependencies.** `@hackcove/ui` has one approved dependency,
   `react-aria-components` (with `@internationalized/date`), for the date picker; its peers are react,
   react-dom and tailwindcss v4. A theme has only the tailwindcss peer. A new dependency needs a
   maintainer's agreement first.
4. **Source imports in `packages/ui` use `.js` specifiers** (`./ui.js`, resolved to the `.tsx`),
   because a `.tsx` specifier is emitted into the `.d.ts` and breaks consumers' types.
5. **A new component** is exported from `packages/ui/src/index.ts`, has its own story, and appears
   in `apps/storybook/src/Gallery.tsx`.

## Adding a theme

A theme is a folder; copy one and change the CSS. The steps are in the README
([How to add a theme](README.md#how-to-add-a-theme)). Each theme names its own scope class (the
class of the first top-level `.<class> { … }` rule in its `theme.css`), and its own `theme.test.ts`
is the contract; Storybook and the e2e find it from `themes/*`, so there is no list to edit.

## The visual check

The maintainers also run a screenshot comparison (PixelSlash, an internal tool that is not published)
over every story in every theme, against the branch's merge-base with `main`. It is not part of the
gate above and **you do not need it to contribute**: it runs from a separate checkout and reports to
a private server that outside contributors have no access to.

What it means for you:

- If you cannot run it, say so in the pull request. A maintainer runs it before merging and reads
  every changed capture.
- A change that should not alter any visuals (a refactor, a doc, a test) is expected to show
  `0 changed`. A component or `theme.css` change will show changes: say in the pull request which
  stories should look different and why. Attach a before/after screenshot from Storybook if you can.
- You can get most of the benefit without it: run Storybook, flip each theme, and read the
  affected stories (and **Overview / All themes**); `bunx nx e2e storybook` checks every theme under
  its scope class.

## Commit messages

Commits are [Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <subject>`,
for example `fix(ui): keep the Pill label on one line`. Nx reads them to version and release each
package, so the type is honest:

- `feat`, `fix` and `perf` release a patch while a package is `0.x`. A `!` after the type, or a
  `BREAKING CHANGE:` footer, releases a minor.
- `docs`, `test`, `chore`, `refactor`, `build` and `ci` release nothing.

Which packages a commit bumps depends on the files it touches, not on its scope.

## Pull requests

- Branch from `main`, keep the change small and focused, and run the gate before you push.
- Describe what changed and why, and say whether you ran the visual check (above).
- CI runs the gate (without the visual check) on every pull request; it needs to be green.
- Maintainers squash-merge, keeping a conventional subject.
- Releases are cut by a maintainer from GitHub Actions ([docs/releasing.md](docs/releasing.md)).
  Contributors never publish.

## Licence

MIT. By contributing you agree your contribution is licensed under the same terms (see `LICENSE`).
