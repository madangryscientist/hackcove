# hackcove

The Hack Cove design system, as an Nx + Bun-workspaces monorepo. Every package here is published
on its own; `0.2.0` of `@hackcove/ui` and the Mocha theme is on npm (MIT).

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui` | `@hackcove/ui` | The React components: primitives, typography roles, a safe Markdown renderer. Written against Tailwind v4 utilities. No theme CSS. |
| `themes/catppuccin-mocha` | `@hackcove/theme-catppuccin-mocha` | The Catppuccin Mocha dark theme: one `theme.css` that remaps those utilities under `.dark`. |
| `themes/thrifty-paper` | `@hackcove/theme-thrifty-paper` | The Thrifty Paper light theme (cream paper, ink text, clay accent): one `theme.css` that remaps those utilities under `.thrifty-paper`. Not yet published. |
| `apps/storybook` | (private) | Storybook for the components, with a toolbar theme switcher that lists every folder under `themes/`. |

Each theme scopes under its own class, which goes on `<html>`: `.dark` for Mocha,
`.thrifty-paper` for Thrifty Paper. With no theme, the look is the components' own default Tailwind
classes; Storybook's `default` choice shows it.

## Use it

```sh
bun add @hackcove/ui @hackcove/theme-catppuccin-mocha
# peers: react >= 18, tailwindcss ^4
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

Releases are change-driven. `nx release` looks at the commits since each package's last tag
(`<project>@<version>`), bumps only the packages that changed, writes each one's `CHANGELOG.md`,
commits and tags the release, pushes, creates a GitHub release, and publishes. The commit rules
it reads are in AGENTS.md ("Commits"). Nothing publishes on a push: a release starts from Actions.
Publishing goes through Nx, never a bare `npm publish`.

### From CI (GitHub Actions)

`.github/workflows/publish.yml` is a manual workflow (Actions → Publish → Run workflow, from
`main`). It runs the gate, then `nx release`. Two inputs:

- `dry_run` (default on) versions and previews changelogs, and publishes nothing. No commit, tag,
  push or GitHub release happens either. Untick it to release for real.
- `project` (optional) releases one project, such as `ui`. Empty releases every project that has a
  release tag.

It authenticates with npm trusted publishing (OIDC), so there is no `NPM_TOKEN` and no OTP. `nx.json`
sets `cli.packageManager` to `npm`, so the publish step (Nx's `@nx/js:release-publish` executor) runs
`npm publish` rather than `bun publish`: bun cannot do npm trusted publishing or prompt for an OTP.
The release commit and tags are pushed with the job's `GITHUB_TOKEN` (`contents: write`), so `main`
must accept pushes from GitHub Actions. One-time setup, by hand:

1. On GitHub, create an environment named `npm-publish` (Settings → Environments); add a required
   reviewer if you want a gate on every publish.
2. On npmjs.com, for each published package (`@hackcove/ui`, `@hackcove/theme-catppuccin-mocha`):
   Settings → Trusted Publisher → GitHub Actions, repository `madangryscientist/hackcove`, workflow
   filename `publish.yml`, environment `npm-publish`.

Nx pushes the release commit, the tags and the GitHub release before it runs `npm publish`. If the
publish then fails, a re-run finds nothing new to release. Publish the version already tagged by hand
with `bunx nx release publish -p <project>` from `main`.

Locally, the same dry run is:

```sh
bunx nx release --dry-run --projects ui,theme-catppuccin-mocha   # use the tagged projects, see below
```

### Only projects with a tag are released

Nx's `git-tag` version resolver refuses a project that has no `<project>@<version>` tag, so
`nx release` cannot run over a project that has never been released. The workflow therefore passes
Nx only the projects that already have a tag on origin (`git tag -l '*@*'`). A package stays out
until its first tag is pushed.

### First publish of a new package

Trusted publishing cannot make a package's first publish, and this is how `ui` and
`theme-catppuccin-mocha` shipped `0.1.0`. `theme-thrifty-paper` has never been published and is
released this way first:

1. Log in to npm with a granular token that bypasses 2FA (`npm login`).
2. On `main`, publish the version already in its `package.json` (0.1.0):
   `bunx nx release publish -p theme-thrifty-paper`. npm stages a brand-new package's first publish,
   so a `0.0.0-stage` placeholder version may also appear alongside it.
3. Delete the token.
4. Tag the commit you published from and push the tag:
   `git tag theme-thrifty-paper@0.1.0 <sha> && git push origin theme-thrifty-paper@0.1.0`.
5. On npmjs.com, add the trusted publisher for `@hackcove/theme-thrifty-paper` (workflow
   `publish.yml`, environment `npm-publish`).

From then on the workflow releases it whenever it has releasable commits. Provenance is only
attached for public repositories. Nx reads only a root `tsconfig.base.json` or `tsconfig.json`, and
TypeScript 7 has no classic compiler API for it to parse them with, so the shared compiler options
live in `tsconfig.shared.json` instead.

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

Try an unpublished change in a consumer checkout: run `bun link` once inside `packages/ui` and
each `themes/<name>`, then `bun link @hackcove/ui` (and the theme) in the consumer. Consumers
install the published `0.x` from npm, so the link is only for checking a change before it is
published. Rebuild `packages/ui` (`bunx nx build ui`) after a change; a linked consumer reads its `dist/`.
