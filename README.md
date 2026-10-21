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

`.github/workflows/publish.yml` is the only thing that publishes: no one publishes from a laptop,
not even a package's first version. It is a manual workflow (Actions → Publish → Run workflow, from
`main`). It runs the gate, then `nx release`. Two inputs:

- `dry_run` (default on) versions and previews changelogs, and publishes nothing. No commit, tag,
  push or GitHub release happens either. Untick it to release for real.
- `project` (optional) releases one project, such as `ui`. Empty releases every releasable project
  (`release.projects` in `nx.json`).

Already-released packages authenticate with npm trusted publishing (OIDC), so there is no
`NPM_TOKEN` and no OTP in their step. `nx.json` sets `cli.packageManager` to `npm`, so the publish
step (Nx's `@nx/js:release-publish` executor) runs `npm publish` rather than `bun publish`: bun
cannot do npm trusted publishing or prompt for an OTP. The release commit and tags are pushed with
the job's `GITHUB_TOKEN` (`contents: write`), so `main` must accept pushes from GitHub Actions.
One-time setup, by hand:

1. On GitHub, create an environment named `npm-publish` (Settings → Environments); add a required
   reviewer if you want a gate on every publish.
2. On npmjs.com, for each published package (`@hackcove/ui`, `@hackcove/theme-catppuccin-mocha`):
   Settings → Trusted Publisher → GitHub Actions, repository `madangryscientist/hackcove`, workflow
   filename `publish.yml`, environment `npm-publish`.

Nx pushes the release commit, the tags and the GitHub release before it runs `npm publish`. If the
publish then fails, a re-run finds nothing new to release. Fix the cause and land a releasable
commit: the next run publishes the next version. A stranded version is never published by hand.
The exception is a first publish: its tag exists from the moment Nx pushes, so a failed first
publish (wrong token scope, expired token) leaves a project the workflow now treats as tagged, and
OIDC cannot publish a package that is not on npm yet. Delete the tag (`git push origin
:refs/tags/<project>@<version>`) and the GitHub release, revert the release commit, and start the
first-release steps again. A dry run does not exercise the token, so it cannot catch this.

Locally, the same dry run of the tagged projects is:

```sh
bunx nx release --dry-run --projects ui,theme-catppuccin-mocha   # use the tagged projects, see below
```

### Tagged projects and new ones

The workflow sorts the releasable projects by their tags on origin (its "Pick" step):

- **Tagged** (a `<project>@<version>` tag exists): released by conventional commits, as above, through OIDC.
- **New** (no such tag): its first publish, in its own step ("First release"), at the version
  already in its `package.json`. Nothing about which projects are new is listed anywhere; it is
  computed from tags.

Nx's `git-tag` version resolver refuses a project with no tag, which is why the two are separate Nx
invocations. The first-release step runs `nx release <version-on-disk> --first-release --projects
<project>` once per new project: `--first-release` falls back to the version on disk, starts the
changelog at the first commit and skips the "already on npm" check, and the explicit specifier keeps
conventional commits from bumping it. It tags `<project>@<version>`, writes `CHANGELOG.md`, pushes
and creates the GitHub release. Because it now has a tag, the project is a tagged project from the
next run on. New and tagged projects can be in the same run; the first-release step goes first.

### First publish of a new package

OIDC trusted publishing cannot make a package's first publish, because npm cannot attach a trusted
publisher to a package that does not exist yet. So the first release authenticates with a
short-lived token that only the workflow's first-release step sees. If a releasable project has no
tag and `NPM_TOKEN` is unset, the workflow fails before it versions, tags or pushes anything, and
names the project. `theme-thrifty-paper` (0.1.0) is the first one.

1. On npmjs.com, make a granular access token: publish rights for the `@hackcove` scope, bypass 2FA,
   shortest expiry that covers the run.
2. `gh secret set NPM_TOKEN --env npm-publish` (paste the token when prompted).
3. Run the workflow with `dry_run` on and read the log: the version (`0.1.0`), the tag
   (`theme-thrifty-paper@0.1.0`), the changelog and the GitHub release it would create. Then run it
   again with `dry_run` off. npm stages a brand-new package's first publish, so a `0.0.0-stage`
   placeholder version may also appear alongside it.
4. On npmjs.com, add the trusted publisher for `@hackcove/theme-thrifty-paper` (workflow
   `publish.yml`, environment `npm-publish`), or `npm trust github …`.
5. `gh secret delete NPM_TOKEN --env npm-publish`, and revoke the token on npmjs.com.

From then on the workflow releases it through OIDC whenever it has releasable commits. Provenance is
only attached for public repositories. Nx reads only a root `tsconfig.base.json` or `tsconfig.json`, and
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
