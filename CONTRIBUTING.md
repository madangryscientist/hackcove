# Contributing to hackcove

Thanks for looking. This repo is the Hack Cove design system: React components (`@hackcove/ui-react`) and
the themes (`@hackcove/themes`, one CSS file per theme), each its own npm package, in a moon +
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
restyling them: components take no `className` or `style`, and a consumer writes no styling. When you propose something, say what recurring need it serves.

## Setup

You need [Bun](https://bun.sh) and Node. Then:

```sh
bun install
bunx playwright install chromium firefox webkit   # once per machine, for the e2e (all three engines)
bunx moon run storybook:storybook   # http://localhost:6006
```

Open Storybook, flip the theme switcher in the toolbar, and read the stories. **Overview / All
themes** shows every component in every theme on one page.

## Layout

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui-react` | `@hackcove/ui-react` | The components. Builds to `dist/` (ESM + `.d.ts`). Peers: react, react-dom, tailwindcss v4. No theme CSS. |
| `themes` | `@hackcove/themes` | One CSS file per theme, `<id>.css`, shipped as-is. |
| `apps/storybook` | (private) | Storybook and the Playwright e2e. |
| `packages/themes-shared` | (private) | How Storybook and the docs find the themes: the `themes/*.css` glob, the theme ids and each theme's scope class. |
| `apps/hack-cove-site` | (private) | The hack-cove.com Astro site, including the `/ui/` component docs; run it with `bunx moon run hack-cove-site:dev` (http://localhost:4321). Its e2e is `bunx moon run hack-cove-site:e2e`. |
| `tools/ui-review` | (private) | Dev tooling for the `ui-review.yml` reusable workflow: a deterministic check of a pull request's added lines and an advisory model review. Not published; no package depends on it. |

## The gate

A change is ready when all of this passes:

```sh
bun install
bunx moon run :typecheck :lint :test :build      # tsc strict · oxlint + check-slop · Vitest · dist + Storybook build
bun run format:check                             # oxfmt --check (`bun run format` fixes)
bunx moon run :pack-check                        # npm pack --dry-run for every package; ui-react also typechecks its tarball in a consumer app
bunx moon run storybook:e2e                      # Playwright, in Chromium, Firefox and WebKit: builds Storybook, flips every theme
bunx moon run hack-cove-site:e2e                 # Playwright: builds the site, flips every theme on the /ui/ pages
```

moon runs every task through the cache, so an unchanged project is a cache hit; `--force` reruns
one anyway. Lint rules are all errors: fix the code, do not disable a rule.

**Nothing is time dependent.** Jacobus, 2026-11-14: "The architecture of the test is wrong if it relies on timings for displaying it. We should be able to pass it in a value and then render that. It should not be time dependent. The component itself should not be time dependent." A component renders from the value it is given, and a test passes that value and asserts what renders. No fake timers, no waiting on a delay, no story driven by a timer, no `waitForTimeout` in an e2e spec. A visual delay, a fade or a label that reverts is CSS (an animation and its delay), as `CopyButton` and `NavigationProgress` do; a pending state is a value the story holds (a promise that never settles, or a button that lands it). The lint (`scripts/slopRules.ts`) fails a test, story or e2e file that uses a fake or real timer, and a `@hackcove/ui-react` component that calls `setTimeout` or `setInterval`; a line with `// time-dependent: <why>` on it or above it is exempt, and needs a reason a reviewer accepts.

Stop a process by the pid you started or by its port. Never `pkill -f` or `killall` a word such as storybook, moon, bun or vite: a shared machine can be running someone else's capture or upload.

Tasks are declared in `.moon/workspace.yml`, `.moon/tasks/all.yml` and each project's `moon.yml`;
each runs the `package.json` script of its name. moon hashes no dependency's files on its own, so a
task that reads another project lists that project's files in its inputs. moon caches locally only;
there is no remote cache. CI keeps `.moon/cache` between runs with `actions/cache`
(`.github/workflows/ci.yml`): a pull request restores its own cache or `main`'s and saves its own,
so one branch never reads another's. `e2e` is never cached. Nx is still installed, for one job
only: `nx release` versions and publishes the packages (`docs/releasing.md`).

The shared compiler options live in `tsconfig.shared.json`, not a root `tsconfig.base.json` or
`tsconfig.json`: Nx, which `nx release` still runs, reads those two names, and TypeScript 7 has no
classic compiler API for it to parse them with.

## Rules of the repo

1. **`@hackcove/ui-react` carries no theme.** Components use stock Tailwind utilities (`bg-white`,
   `text-slate-900`, …) and never a `dark:` variant or a palette colour. A theme is the only place
   a palette lives; it remaps those utilities under its own scope class. The colour utilities a
   component may use are listed in `packages/ui-react/palette.json`. A new one is a palette change: add
   it there and remap it in every theme in the same change. With no theme the
   components render in Tailwind's own default colours; that works, but it is only what a theme
   remaps, not a look the repo designs or checks, so Storybook offers no unthemed choice.
2. **A theme is a file and nothing else registers it.** No theme name appears in code.
3. **Almost no runtime dependencies.** `@hackcove/ui-react` has one approved dependency,
   `react-aria-components` (with `@internationalized/date`), for the date picker; its peers are react,
   react-dom and tailwindcss v4, plus `@types/react` and `@types/react-dom` as optional peers (types only, so a consumer's
   tsc resolves `react` under strict linkers). `@hackcove/themes` has only the tailwindcss peer. A new dependency needs a
   maintainer's agreement first.
4. **Source imports in `packages/ui-react` use `.js` specifiers** (`./ui.js`, resolved to the `.tsx`),
   because a `.tsx` specifier is emitted into the `.d.ts` and breaks consumers' types.
5. **A new component** is exported from `packages/ui-react/src/index.ts`, has its own story, and appears
   in `apps/storybook/src/Gallery.tsx`. Its docs page names Do/Don't topics, the stories
   `Do<Topic>` and `Dont<Topic>`. A topic shows both halves when a counter-example teaches
   something; one shown on its own (a feature, or a wrong way the types already refuse) is listed
   with its reason in `ONE_HALF` in `apps/hack-cove-site/test/docs.test.tsx`.
   Its story title is `<Section>/<Page name>`, read from the site's `componentSections`
   (`apps/hack-cove-site/src/content/components/`): add the component to a page there first, then
   title the story file with that page's section and name. Storybook's sidebar takes its order from
   the same list, so nothing else needs editing, and `visual-plan.test.ts` fails on a title that
   differs from the site's.

6. **No `className` or `style` on a component.** A public component has no styling prop and its
   HTML props are typed `Unstyled<…>` (`packages/ui-react/src/props.ts`). If a story or a site needs a
   look the component lacks, propose the prop or variant (say what recurring need it serves) or
   drop the look. `noStyling.test.tsx` enforces it.

## Adding a theme

A theme is one CSS file in `themes/`; copy one and change it. The steps are in the README
([How to add a theme](README.md#how-to-add-a-theme)). Each theme names its own scope class (the
class of the first top-level `.<class> { … }` rule in its CSS file), and `themes/themes.test.ts`
is the contract for every CSS file there; Storybook and the e2e find them from `themes/*.css`, so there is no list to edit. The
contract includes WCAG AA contrast, measured from the theme's CSS for every pairing in
`palette.json` (`packages/themes-shared/src/contrastRules.ts`); a colour that fails is fixed in
the theme's CSS file, with a comment saying why when a published token moves.

## The visual check

The maintainers also run a screenshot comparison (PixelSlash, an internal tool that is not published)
against the branch's merge-base with `main`. It is not part of the gate above and **you do not need
it to contribute**: it runs from a separate checkout and reports to a private server that outside
contributors have no access to.

The stories are split into groups, one per section of the [component docs](https://hack-cove.com/ui/)
(Layout, Page layouts, Text, … and Overview), read from
`apps/hack-cove-site/src/content/components`. Each group is its own folder (`.pixelslash/<section>/`)
and its own PixelSlash project (`hackcove-ui-<section>`), with its own baseline and review queue.
A story file goes in the section of the docs page that names it in `pairs`, `fullPage` or
`stories`; one that no page names fails the storybook tests, so a new story file comes with its
docs page.

**One theme in full, the Gallery sections in the rest.** Every story is shot in the reference
theme, the first file in `themes/` in sorted order (`catppuccin-latte.css` today), worked
out from the folder, never named in code. Every other theme is shot in **Overview / Gallery
sections** only, one story per `gallerySections` entry, which render every component the library
exports (a storybook test fails on one that is missing). So a regression in any story shows in the
reference theme, every component is still seen in every theme, and a theme added costs a Gallery's
worth of shots, not every story. A new theme whose file sorts first becomes the reference and takes
the full set over, so its first upload shows every story as new in it and removed from the old
reference, but for the old reference's Gallery sections, which it keeps. Stories shot once (**Overview / All themes sections**, which show every theme in one
shot) stay shot once.

The check runs in one of two modes:

- **Affected** (`bunx moon run storybook:visual`): only the stories
  the change reaches, found by following imports from each story file. They are shot in the
  reference theme, and when the Gallery sections are among them (a component change usually
  reaches them), those are shot in every theme. A change to the reference theme's CSS file captures
  every story in it and the Gallery sections in every other theme (the file may be a new theme that
  took the reference over); a change to another theme's CSS file, only the Gallery sections in that
  theme.
  Overview is always captured. Anything shared (the palette, Storybook's config, the lockfile, a
  `package.json`, the visual scripts) or a diff that cannot be read captures everything. The run
  says at the top what it picked and why, how much it skipped, and the shots per theme.
- **Everything** (`bunx moon run storybook:visual -- --all`, or
  `VISUAL_ALL=1 bunx moon run storybook:visual`): every group whole. An upload (`visual-upload`) is always this mode.

The local run (`visual`) builds the merge-base's Storybook in a shared worktree, captures it and
writes one report per group to `apps/storybook/.pixelslash/<slug>/report/index.html`. An upload
(`VISUAL_PARALLEL=3 bunx moon run storybook:visual-upload`, which needs `PIXELSLASH_SERVER` and a token;
see "Uploads can run side by side" below) builds and
captures no base at all. It has two modes, picked from the checkout:

- **A branch rebased on origin/main** captures the branch only and uploads it. The server diffs it
  against the `main` build it already holds, so the run's summary prints the server's counts against main
  (changed and new, and how many shots are to review, with the build's status) and the
  build's page. Before any capture it checks that each project holds a `main` build at the
  merge-base or an ancestor, and fails naming the project when none does.
- **A checkout at origin/main's tip** (clean; a detached HEAD in a throwaway worktree counts)
  uploads that commit as branch `main` and compares nothing. This is the step after a merge that
  keeps those `main` builds on the server. Any other commit on `main` is refused.

**Uploads can run side by side.** The groups of an upload each write their own
`.pixelslash/<section>/` and send to their own PixelSlash project, so the run can take several at
once, and the slowest group, not the sum, then sets the wall time. `VISUAL_PARALLEL` (a whole
number, default 1) is how many groups run at once:

```bash
VISUAL_PARALLEL=3 bunx moon run storybook:visual-upload
```

A bare `bunx moon run storybook:visual-upload` takes one group at a time. Only an upload reads
`VISUAL_PARALLEL`. Each
group's capture then takes `max(1, min(10, floor(cpus / VISUAL_PARALLEL)))` workers, where `cpus` is
what `os.availableParallelism()` reports (the CPUs the process may use, so a CPU-limited scope
counts its own), and ten is PixelSlash's own ceiling. Three groups on 12 CPUs take 4 workers each;
with the default of 1 a group takes PixelSlash's own `min(10, cpus)`. Groups times workers stays
within the CPUs, so a `VISUAL_PARALLEL` above the CPU count is refused. The run logs
`capturing with N workers` for each group. A capture's port is picked free and bound a moment
later, so two groups can pick the same one; the one that finds it taken picks another and tries
again, up to 3 times. The local compare (`visual`) stays serial: it builds and captures the base
under one lock.

PixelSlash ends a build at errored on a shot over 24.5 Mpx (19140px tall at 1280 wide), so the
one-page **Overview / Gallery** and **Overview / All themes** are not shot whole: the run shoots
**Overview / Gallery sections** and **Overview / All themes sections** instead, one story per entry
of `gallerySections` in `apps/storybook/src/Gallery.tsx`. A new Gallery block goes in a section
(or a new one, with a story in both files). The run fails on a shot over the limit, naming it, and
warns on one past 75% of it.

What it means for you:

- If you cannot run it, say so in the pull request. A maintainer runs it before merging and reads
  every changed capture.
- A change that should not alter any visuals (a refactor, a doc, a test) is expected to show
  `0 changed`. A component or theme CSS change will show changes: say in the pull request which
  stories should look different and why. Attach a before/after screenshot from Storybook if you can.
- You can get most of the benefit without it: run Storybook, flip each theme, and read the
  affected stories (and **Overview / All themes**); `bunx moon run storybook:e2e` checks every theme under
  its scope class.

## Commit messages

Commits are [Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <subject>`,
for example `fix(ui-react): keep the Pill label on one line`. `nx release` reads them to version and release each
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
