# hackcove — repo conventions

The Hack Cove design system: React components (`@hackcove/ui-react`) and the themes
(`@hackcove/themes`, one CSS file per theme), each its own npm package, in a moon + Bun-workspaces monorepo. moon runs every task; Nx is
here only for `nx release` (`docs/releasing.md`).
`README.md` is the user-facing contract (install, usage, how to add a theme);
`CONTRIBUTING.md` is the guide for contributors.

This file is the operating agreement for agents working here. Maintainers' tooling may load extra,
private agent rules on top of it.

## Purpose

Hack Cove UI is an opinionated, strict UI library that is fully integrated with its theming. The
components and the themes are designed together: every theme remaps every palette utility the
components use (`palette.json`, `themes/themes.test.ts`), so switching theme reskins a whole site with
no component change and nothing to configure. It fixes the look so agents reliably build good-looking
sites. It is not an extensible framework.

The default answer to a new prop, variant or escape hatch is **no**, unless it is the one right way
to meet a need that recurs across consumers. Prefer fixed named choices over open styling.
Consumers compose the parts and never restyle them: no component takes `className` or `style`, and
a consumer writes no styling of its own.

The end goal is a site built with components configured through props and nothing else: no custom
CSS, Tailwind classes or one-off styling. That is why the library ships whole pages (error, 404,
offline) and a loading skeleton matching each component's and layout's real shape in every theme.
Docs and site copy lead with the one way to do a thing, with do and don't, rather than a catalogue
of options.

## Layout

| Project | Path | What it is |
| --- | --- | --- |
| `ui-react` | `packages/ui-react` | `@hackcove/ui-react`: the components. Builds to `dist/` (ESM + `.d.ts`). Peers: react, react-dom, tailwindcss v4, and optional `@types/react` + `@types/react-dom` (types reach consumers under isolated linkers); one runtime dependency, react-aria-components (the date picker). No theme CSS. |
| `themes` | `themes` | `@hackcove/themes`: every theme, one CSS file each, shipped as-is: `catppuccin-mocha.css` (dark; scope `.dark`), `catppuccin-latte.css` (light; scope `.latte`), `thrifty-paper.css` (light; scope `.thrifty-paper`), `thriftloop.css` (light; scope `.thriftloop`) and `thriftloop-dark.css` (dark; scope `.thriftloop-dark`). |
| `storybook` | `apps/storybook` | Storybook for the components; a toolbar switcher lists every theme CSS file in `themes/`. Its `e2e/` is the Playwright layer (`test:e2e`). Private. |
| `themes-shared` | `packages/themes-shared` | `@hackcove/themes-shared`: how Storybook and the docs find themes (the `themes/*.css` glob, the theme ids and each theme's scope class). Private; not in `nx release`. |
| `hack-cove-site` | `apps/hack-cove-site` | The hack-cove.com Astro site, with the `/ui/` component docs (pages built from the Storybook stories, a generated `props.json` and `/ui/llms.txt`). Builds `dist/` against the workspace `@hackcove/ui-react` and `@hackcove/themes` (`workspace:*`). `deploy.sh` direct-uploads to Cloudflare Pages; only Jacobus runs it. Private; not in `nx release`. |
| `ui-review` | `tools/ui-review` | `@hackcove/ui-review`: the engine behind the `ui-review.yml` reusable workflow (consumer pull requests are checked for building their UI the Hack Cove way: a deterministic layer, then an advisory model layer). Dev tooling; private; not in `nx release`. |

**One package, one CSS file per theme.** Adding a theme is adding a file (`README.md`, "How to add a
theme"); nothing else registers it: the package's `exports` and `files` are globs. A theme's id is its
file name without `.css` (`catppuccin-latte`); it names the switcher entry and the visual shots, so an
id never changes once it has baselines. **Each theme names its own scope class**: the class of the
first top-level `.<class> { … }` rule in its CSS file (Mocha's is `.dark`, Latte's `.latte`,
thrifty-paper's `.thrifty-paper`, Thriftloop Dark's `.thriftloop-dark`). Storybook and the e2e read
it from there. With no theme the components render in Tailwind's own default colours, a plain light
look; that is only what a theme remaps, not a look the repo designs or checks, so Storybook, its
Overview and the visual matrix list `themes/*.css` and nothing else.

**The site composes ui components.** `apps/hack-cove-site` is a composition of `@hackcove/ui-react` and a theme and nothing of its own; a custom style or component there is a flag, not a fix. Put it on the list in the site's `README.md` (a swap, a hackcove ticket, or "Custom, by design" with the reason), and do not add the style to the site.

**React Native comes later, in this repo.** `@hackcove/ui-react-native` will be its own moon project at `packages/ui-react-native`, built natively rather than through react-native-web. What the two renderers share stays in sync through a shared core package and PixelSlash parity.

## The gate

Everything runs through moon 2.6.5 (Bun, strict tsconfig, oxlint + oxfmt, Vitest). Tasks are
declared in `.moon/workspace.yml`, `.moon/tasks/all.yml` and each project's `moon.yml`, and each
runs the `package.json` script of its name. moon hashes no dependency's files on its own, so a task
that reads another project lists that project's files in its inputs; a new cross-project read adds
one there. A change is green when
all of these pass **from the checkout**:

```bash
bun install                                        # a fresh checkout has no node_modules
bunx moon run --concurrency 3 :typecheck :lint :test :build   # tsc strict · oxlint --type-aware --deny-warnings + check-slop · Vitest · dist + Storybook build
bun run format:check                               # oxfmt --check  (`bun run format` fixes)
bunx moon run --concurrency 3 :pack-check        # npm pack --dry-run for every package; ui-react also typechecks its tarball in a consumer app
bunx moon run storybook:e2e                      # Playwright (Chromium, Firefox, WebKit): builds Storybook, serves it on 127.0.0.1:6007, flips every theme
bunx moon run hack-cove-site:e2e                 # Playwright: builds the site, serves it on 127.0.0.1:4322, flips every theme on the /ui/ pages
```

An unchanged project is a cache hit; `--force` on `moon run` forces a rerun. Lint rules are
all errors; fix the code, do not disable a rule. Stop a process by the pid you started or by its port. Never `pkill -f` or `killall` a word such as storybook, moon, bun or vite: a shared machine can be running someone else's capture or upload. A change to a component or a theme's CSS file also gets
a look: `bunx moon run storybook:storybook`, flip the theme switcher, and read the stories. Every component exported from `packages/ui-react/src/index.ts` has its own story and appears in `apps/storybook/src/Gallery.tsx`. A new component adds both in the same change. **A story's title is `<Section>/<Page name>`, taken from the site's `componentSections` (`apps/hack-cove-site/src/content/components/`), never written from memory:** add the component to a page there first, then give its story file that page's section and name. The Storybook sidebar is built from the same list, in the site's rail order (`apps/storybook/scripts/visual-plan.ts`, `sidebarOrder`), so there is no sort list to edit; `visual-plan.test.ts` fails on a title that is not the site's, or a story file no page names. **Overview / All themes** is the one-page check of every component in every theme.

**Nothing is time dependent.** Jacobus, 2026-11-14: "The architecture of the test is wrong if it relies on timings for displaying it. We should be able to pass it in a value and then render that. It should not be time dependent. The component itself should not be time dependent." A component renders from the value it is given, and a test passes that value and asserts what renders. No fake timers, no waiting on a delay, no story driven by a timer, no `waitForTimeout` in an e2e spec. A visual delay, a fade or a label that reverts is CSS (an animation and its delay), as `CopyButton` and `NavigationProgress` do; a pending state is a value the story holds (a promise that never settles, or a button that lands it). The lint (`scripts/slopRules.ts`) fails a test, story or e2e file that uses a fake or real timer, and a `@hackcove/ui-react` component that calls `setTimeout` or `setInterval`; a line with `// time-dependent: <why>` on it or above it is exempt, and needs a reason a reviewer accepts.

The e2e runs every spec in Chromium, Firefox and WebKit (`apps/storybook/playwright.config.ts`) and needs all three once per machine: `bunx playwright install chromium firefox webkit` (on Linux, `--with-deps` in CI). The PixelSlash visual check stays Chromium-only. A spec that cannot pass in one engine gets a scoped, commented skip (or a conditional assertion) naming the engine and the reason, never a blanket skip; a real cross-engine failure is fixed in the component. It discovers themes
from `themes/*.css` like the switcher does and asserts each one under the scope class its CSS file
names, so a new theme needs no test edit.

**The visual check** (PixelSlash, `CONTRIBUTING.md`, "The visual check") is split into one group
per section of the site's component docs, read from `componentSections`: one `.pixelslash/<section>/` folder
and one PixelSlash project `hackcove-ui-<section>` each, plus Overview, which is
always captured. Every story is shot in the reference theme, the first theme file
in sorted order (`themeFiles`), read from `themes/`, never named in code. Every other theme is shot
in **Overview / Gallery sections** only, which must render every component `index.ts` exports
(`visual-shots.test.ts`), so a theme added costs one Gallery, not every story. A theme whose file
sorts first becomes the reference and moves the full set to it. `bunx moon run storybook:visual` captures only the
stories and themes the change reaches against the merge-base, and its report says what it picked
and why. `bunx moon run storybook:visual -- --all` (or `VISUAL_ALL=1 bunx moon run storybook:visual`)
captures everything. A gate run is `--all`. Every story file is
named by a docs page (`pairs`, `fullPage` or `stories`); the storybook tests fail on one that is not.

**Uploads run their groups in parallel; the local compare does not.** `scripts/visual.ts --run`
plans, runs each group and totals them in one process. `visual-upload` runs `VISUAL_PARALLEL`
groups at once (default 1), as `VISUAL_PARALLEL=3 bunx moon run storybook:visual-upload`; a bare
upload takes one at a time. `visual` stays serial, since it builds and captures the base under the
baseline lock. Each group takes `max(1, min(10, floor(cpus / VISUAL_PARALLEL)))` capture workers,
`cpus` from `os.availableParallelism()`, so never set `VISUAL_PARALLEL` above the CPUs: groups times
workers must fit. `CONTRIBUTING.md`, "The visual check", has the rest, including the port retry.

**A shot may not pass PixelSlash's 24.5 Mpx limit** (19140px tall at 1280 wide; PS-323 ends a build
at errored on one). The two one-page Overviews, **Gallery** and **All themes**, are for people and are not
shot: the run shoots them in slices instead, one story per entry of `gallerySections`
(`apps/storybook/src/Gallery.tsx`) in **Overview / Gallery sections** and **Overview / All themes
sections**, and `visualSkipped` (`scripts/visual-shots.ts`) lists the two skipped pages. A new
Gallery block goes in a `gallerySections` entry and gets a story in both files (a test fails
otherwise). The run fails, naming the shot, on one over the limit and warns at 75% of it: split
that section.

## Browser support

Hack Cove supports the web platform as of the Baseline digest of August 2026
(<https://web.dev/blog/baseline-digest-aug-2026>, Jacobus, 2026-10-28). Anything Baseline newly
available by August 2026 may be used. Anything newer goes in only as feature-detected progressive
enhancement, with a working fallback. The `browserslist` in the root `package.json` is the
declared floor (Chrome and Edge 131, Firefox 143, Safari and iOS 18.4); it is declarative, since
nothing in the toolchain reads it (Tailwind v4 and Vite hard-code their own targets), so the e2e in
three engines is what enforces it. Use of a feature that raises the floor (check
[web.dev/baseline](https://web.dev/baseline) or MDN) raises the `browserslist` in the same
change, and says so in the README's "Browser support". The visual check is Chromium-only.

## Commits: conventional, because nx reads them

Every commit is `<type>(<scope>): <subject>`, as in `fix(ui-react): keep the Pill label on one line`:
branch commits and the squash commit on `main` alike. The squash commit on `main` is the one
`nx release` reads, so its subject keeps this form.

The type is honest because it drives the version bump:

- While a package is `0.x`, Nx shifts each bump one step down: `feat`, `fix` and `perf` → patch. A `!`
  after the type, or a `BREAKING CHANGE:` footer → minor. Nothing reaches `1.0.0` by a commit; that
  is a decision for later.
- `docs`, `test`, `chore`, `refactor`, `build` and `ci` release nothing.

Before 1.0, an API rename or removal is a plain breaking change: a `!` commit, with the mechanical
swap in the package's `MIGRATING.md`. Consumers migrate in their bump, so the old name goes in the
same change, since an alias would leave two ways to do one thing.

Versions come only from this bump: `publish.yml` takes no version input and nothing bumps by hand.

Which packages a commit bumps is decided by the files it touches, not by its scope. A `feat(ui-react)`
that touches only `packages/ui-react` bumps `@hackcove/ui-react`, and nothing else.

## Landing: through a pull request

hackcove lands through pull requests (Jacobus, 2026-10-27). Who opens and who merges is the
global rule; what is particular to hackcove:

- **Screenshots before the merge.** The planner gates the PR's head, reads the PixelSlash
  reports, and uploads that commit's screenshots (`VISUAL_PARALLEL=3 bunx moon run storybook:visual-upload`, every group
  whole, each to its own `hackcove-ui-<section>` project) before it merges. The upload captures
  the branch only: the PixelSlash server diffs it against the `main` build it already holds, and
  the run fails naming the project if it holds none at the merge-base or an ancestor.
- **Screenshots after the merge.** The planner then runs `VISUAL_PARALLEL=3 bunx moon run storybook:visual-upload` on a
  worktree at the merge commit (a detached HEAD at origin/main's tip is fine). Nothing else seeds
  `main`'s builds, so a merge without this step leaves the next branch with no baseline. A release
  commit that `publish.yml` pushes needs no upload of its own: the server picks its parent's build.
- **The squash subject stays conventional** (`gh pr merge <pr> --squash --subject "…"`),
  because `nx release` reads it.
- **No branch protection.** `publish.yml` pushes its release commit straight to `main`, so
  nothing on GitHub blocks a merge and the planner enforces the rule: no merge while CI or the
  PixelSlash check is failing or pending, unless the PR changes nothing a screenshot can see and
  says so.
- No commit, PR title or PR body carries a `Co-Authored-By` or any other AI attribution line.

## Repo invariants

1. **`@hackcove/ui-react` carries no theme.** Components are written against stock Tailwind utilities
   (`bg-white`, `text-slate-900`, …) and never contain a `dark:` variant or a palette colour. A
   theme is the only place a palette lives, and it remaps those utilities under its own scope
   class (`.dark` for Mocha). Components use only the colour utilities in
   `packages/ui-react/palette.json` (`palette.test.ts`). A new colour utility in a component is a
   palette change: add it to `palette.json` and remap it in every theme in the same commit.
2. **A theme is a file and nothing else registers it.** No theme name appears in code: Storybook
   globs `themes/*.css`, and `themes/themes.test.ts` is the contract for every CSS file there (name
   `@hackcove/themes`, wildcard exports and `files` that list no theme, rules scoped under each
   file's own scope class, no Tailwind import, remaps every palette utility, clears the WCAG AA contrast contract in `packages/themes-shared/src/contrastRules.ts` and the distinction contract in `packages/themes-shared/src/distinction.ts` (colours a page must tell apart, by OKLab distance); a dark theme also declares `@custom-variant dark`).
   The scope class is read from the CSS file, never listed. Do not add a theme list anywhere.
3. **Packages stay (nearly) dependency-free at runtime.** `@hackcove/ui-react` has one approved runtime
   dependency, `react-aria-components`, for the date picker (with `@internationalized/date`, whose
   `CalendarDate` is the picker's value type and which RAC already brings in); its peers are react,
   react-dom and tailwindcss v4. `@hackcove/themes` has only the tailwindcss peer. Any other dependency is a
   human decision.
4. **`packages/ui-react` source imports use `.js` specifiers** (`./ui.js`, resolved to the `.tsx`). A
   `.tsx` specifier is emitted into the `.d.ts` unchanged and points at a file `dist` does not
   have, which silently breaks consumers' types.
5. **No styling escape hatch.** No component exported from `packages/ui-react/src/index.ts` accepts
   `className` or `style`, as an own prop or through the HTML/ARIA props it spreads (those are typed
   `Unstyled<…>` from `props.ts`; `data-*`, `aria-*` and event props still pass). A need for a
   different look is a prop or a variant on the component, the one right way, or no. A class
   inside `packages/ui-react` is internal. `ContainerFrame` and `PageHeaderContent` take a
   `className` for the library's own layouts and are not exported from `index.ts`.
   `noStyling.test.tsx` fails if a public component's props accept either.
6. **Releases go only through the Action, and stay pre-release.** `.github/workflows/publish.yml`
   (which runs `nx release`) is the only way a package reaches npm: nothing is published from a
   laptop, a first publish included. Never run `nx release publish`, a bare `npm publish` or
   `npm login`. Jacobus or the hackcove planner dispatches it whenever a release is needed, with no
   sign-off; the `npm-publish` environment has no approval step and accepts runs from `main` only.
   Every release is a pre-release: versions stay `0.x`, and moving a package to `1.0.0` is
   Jacobus's decision. A new package's first publish uses the workflow's `NPM_TOKEN` step
   (`docs/releasing.md`, "First publish of a new package"); Jacobus sets and deletes that secret.
7. **Changes reach `main` only through a merged PR.** Nobody pushes to `main` directly; the
   release workflow's release commit is the one exception. Every package is MIT (a `LICENSE` in
   each package and at the root).
