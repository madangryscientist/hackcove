# hackcove — repo conventions

The Hack Cove design system: React components (`@hackcove/ui`) and one folder per theme
(`@hackcove/theme-<name>`), each its own npm package, in an Nx + Bun-workspaces monorepo.
`README.md` is the user-facing contract (install, usage, how to add a theme);
`CONTRIBUTING.md` is the guide for contributors.

This file is the operating agreement for agents working here. Maintainers' tooling may load extra,
private agent rules on top of it.

## Purpose

Hack Cove UI is an opinionated, strict UI library that is fully integrated with its theming. The
components and the themes are designed together: every theme remaps every palette utility the
components use (`palette.json`, each `theme.test.ts`), so switching theme reskins a whole site with
no component change and nothing to configure. It fixes the look so agents reliably build good-looking
sites. It is not an extensible framework.

The default answer to a new prop, variant or escape hatch is **no**, unless it is the one right way
to meet a need that recurs across consumers. Prefer fixed named choices over open styling.
Consumers compose the parts and never restyle them: no component takes `className` or `style`, and
a consumer writes no styling of its own.

## Layout

| Project | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | `@hackcove/ui`: the components. Builds to `dist/` (ESM + `.d.ts`). Peers: react, react-dom, tailwindcss v4, and optional `@types/react` + `@types/react-dom` (types reach consumers under isolated linkers); one runtime dependency, react-aria-components (the date picker). No theme CSS. |
| `theme-catppuccin-mocha` | `themes/catppuccin-mocha` | `@hackcove/theme-catppuccin-mocha`: one `theme.css`, shipped as-is. Dark; scope `.dark`. |
| `theme-thrifty-paper` | `themes/thrifty-paper` | `@hackcove/theme-thrifty-paper`: one `theme.css`, shipped as-is. Light (Thrifty's cream paper); scope `.thrifty-paper`. |
| `storybook` | `apps/storybook` | Storybook for the components; a toolbar switcher lists every `themes/*` folder. Its `e2e/` is the Playwright layer (`test:e2e`). Private. |
| `themes-shared` | `packages/themes-shared` | `@hackcove/themes-shared`: how Storybook and the docs find themes (the `themes/*/theme.css` glob and each theme's scope class). Private; not in `nx release`. |
| `hack-cove-site` | `apps/hack-cove-site` | The hack-cove.com Astro site, with the `/ui/` component docs (pages built from the Storybook stories, a generated `props.json` and `/ui/llms.txt`). Builds `dist/` against the workspace `@hackcove/ui` and `@hackcove/theme-catppuccin-mocha` (`workspace:*`). `deploy.sh` direct-uploads to Cloudflare Pages; only Jacobus runs it. Private; not in `nx release`. |

**One folder, one publishable package per theme.** Adding a theme is copying a folder
(`README.md`, "How to add a theme"); nothing else registers it. **Each theme names its own scope
class**: the class of the first top-level `.<class> { … }` rule in its `theme.css` (Mocha's is
`.dark`, thrifty-paper's `.thrifty-paper`). Storybook and the e2e read it from there. A theme is
required: the components' stock Tailwind utilities are only what a theme remaps, never a look to
ship, so Storybook, its Overview and the visual matrix list `themes/*` and nothing else.

**The site composes ui components.** `apps/hack-cove-site` is a composition of `@hackcove/ui` and a theme and nothing of its own; a custom style or component there is a flag, not a fix. Put it on the list in the site's `README.md` (a swap, a hackcove ticket, or "Custom, by design" with the reason), and do not add the style to the site.

## The gate

Everything runs through Nx (Bun, strict tsconfig, oxlint + oxfmt, Vitest). A change is green when
all of these pass **from the checkout**:

```bash
bun install                                        # a fresh checkout has no node_modules
bunx nx run-many -t typecheck lint test build      # tsc strict · oxlint --type-aware --deny-warnings + check-slop · Vitest · dist + Storybook build
bun run format:check                               # oxfmt --check  (`bun run format` fixes)
bunx nx run-many -t pack-check                     # npm pack --dry-run for every package; ui also typechecks its tarball in a consumer app
bunx nx e2e storybook                              # Playwright: builds Storybook, serves it on 127.0.0.1:6007, flips every theme
bunx nx e2e hack-cove-site                         # Playwright: builds the site, serves it on 127.0.0.1:4322, flips every theme on the /ui/ pages
```

`bunx nx affected -t ...` for just what changed; `--skip-nx-cache` to force a rerun. Lint rules are
all errors; fix the code, do not disable a rule. A change to a component or a `theme.css` also gets
a look: `bunx nx run storybook:storybook`, flip the theme switcher, and read the stories. Every component exported from `packages/ui/src/index.ts` has its own story and appears in `apps/storybook/src/Gallery.tsx`. A new component adds both in the same change. **Overview / All themes** is the one-page check of every component in every theme.

The e2e needs a Chromium once per machine: `bunx playwright install chromium`. It discovers themes
from `themes/*` like the switcher does and asserts each one under the scope class its `theme.css`
names, so a new theme needs no test edit.

## Commits: conventional, because nx reads them

Every commit is `<type>(<scope>): <subject>`, as in `fix(ui): keep the Pill label on one line`:
branch commits and the squash commit on `main` alike. The squash commit on `main` is the one
`nx release` reads, so its subject keeps this form.

The type is honest because it drives the version bump:

- While a package is `0.x`, Nx shifts each bump one step down: `feat`, `fix` and `perf` → patch. A `!`
  after the type, or a `BREAKING CHANGE:` footer → minor. Nothing reaches `1.0.0` by a commit; that
  is a decision for later.
- `docs`, `test`, `chore`, `refactor`, `build` and `ci` release nothing.

Which packages a commit bumps is decided by the files it touches, not by its scope. A `feat(ui)`
that touches only `packages/ui` bumps `@hackcove/ui`, and nothing else.

## Repo invariants

1. **`@hackcove/ui` carries no theme.** Components are written against stock Tailwind utilities
   (`bg-white`, `text-slate-900`, …) and never contain a `dark:` variant or a palette colour. A
   theme is the only place a palette lives, and it remaps those utilities under its own scope
   class (`.dark` for Mocha). Components use only the colour utilities in
   `packages/ui/palette.json` (`palette.test.ts`). A new colour utility in a component is a
   palette change: add it to `palette.json` and remap it in every theme in the same commit.
2. **A theme is a folder and nothing else registers it.** No theme name appears in code: Storybook
   globs `themes/*/theme.css`, and each theme's own `theme.test.ts` is the contract (name
   `@hackcove/theme-<folder>`, exports + `files` = `theme.css` only, rules scoped under the
   theme's scope class, no Tailwind import, remaps every palette utility; a dark theme also declares `@custom-variant dark`).
   The scope class is read from `theme.css`, never listed. Do not add a theme list anywhere.
3. **Packages stay (nearly) dependency-free at runtime.** `@hackcove/ui` has one approved runtime
   dependency, `react-aria-components`, for the date picker (with `@internationalized/date`, whose
   `CalendarDate` is the picker's value type and which RAC already brings in); its peers are react,
   react-dom and tailwindcss v4. A theme has only the tailwindcss peer. Any other dependency is a
   human decision.
4. **`packages/ui` source imports use `.js` specifiers** (`./ui.js`, resolved to the `.tsx`). A
   `.tsx` specifier is emitted into the `.d.ts` unchanged and points at a file `dist` does not
   have, which silently breaks consumers' types.
5. **No styling escape hatch.** No component exported from `packages/ui/src/index.ts` accepts
   `className` or `style`, as an own prop or through the HTML/ARIA props it spreads (those are typed
   `Unstyled<…>` from `props.ts`; `data-*`, `aria-*` and event props still pass). A need for a
   different look is a prop or a variant on the component, the one right way, or no. A class
   inside `packages/ui` is internal. `ContainerFrame` and `PageHeaderContent` take a
   `className` for the library's own layouts and are not exported from `index.ts`.
   `noStyling.test.tsx` fails if a public component's props accept either.
6. **Only the Action publishes, and only maintainers push to `main`.** Nothing is published from
   a laptop, a first publish included: `.github/workflows/publish.yml` (which runs `nx release`)
   is the only path. Jacobus or the hackcove planner dispatches it; the `npm-publish` environment
   has no approval step and accepts runs from `main` only. Never run `nx release publish`, a bare `npm publish`
   or `npm login`. A new package's first publish uses the workflow's `NPM_TOKEN` step
   (`docs/releasing.md`, "First publish of a new package"); Jacobus sets and deletes that secret.
   Agents and contributors do not push to `main`. Every package is MIT (a `LICENSE` in each
   package and at the root); versions stay `0.x`.
