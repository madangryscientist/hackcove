# Releasing

Maintainer notes for publishing the `@hackcove/*` packages. Contributors do not need any of this: a
release is started by a maintainer, from Actions.

Releases are change-driven. `nx release` looks at the commits since each package's last tag
(`<project>@<version>`), bumps only the packages that changed, writes each one's `CHANGELOG.md`,
commits and tags the release, pushes, creates a GitHub release, and publishes. The commit rules
it reads are in [CONTRIBUTING.md](../CONTRIBUTING.md#commit-messages). Nothing publishes on a push: a release starts from Actions.
Publishing goes through Nx, never a bare `npm publish`.

## From CI (GitHub Actions)

`.github/workflows/publish.yml` is the only thing that publishes: no one publishes from a laptop,
not even a package's first version. It is a manual workflow (Actions → Publish → Run workflow, from
`main`). It runs the gate, then `nx release`. Two inputs:

- `dry_run` (default on) versions and previews changelogs, and publishes nothing. No commit, tag,
  push or GitHub release happens either. Untick it to release for real.
- `project` (optional) is only for deliberately releasing one project on its own, such as `ui` (a
  re-publish after a failed first publish, say). A release is started with it empty, which releases
  every releasable project (`release.projects` in `nx.json`). One run per project buys extra gate
  runs and separate release commits, and each run versions only its own project, so a package
  changed in the same commit is missed.

Already-released packages authenticate with npm trusted publishing (OIDC), so there is no
`NPM_TOKEN` and no OTP in their step. `nx.json` sets `cli.packageManager` to `npm`, so the publish
step (Nx's `@nx/js:release-publish` executor) runs `npm publish` rather than `bun publish`: bun
cannot do npm trusted publishing or prompt for an OTP. The release commit and tags are pushed with
the job's `GITHUB_TOKEN` (`contents: write`), so `main` must accept pushes from GitHub Actions.
One-time setup, by hand:

1. On GitHub, create an environment named `npm-publish` (Settings → Environments); add a required
   reviewer if you want a gate on every publish.
2. On npmjs.com, for each published package (`@hackcove/ui`, `@hackcove/theme-catppuccin-mocha`,
   `@hackcove/theme-thrifty-paper`):
   Settings → Trusted Publisher → GitHub Actions, repository `madangryscientist/hackcove`, workflow
   filename `publish.yml`, environment `npm-publish`.

The release commit also carries `bun.lock`. The workspace entries in it hold each package's version, so
`scripts/release-version-actions.cjs` (`release.version.versionActions` in `nx.json`) runs
`bun install --lockfile-only` after the bump and Nx stages the file. Nx's own refresh is not used: it
follows `cli.packageManager`, which must stay `npm` for the publish step, and would run
`npm install --package-lock-only`. After a release, `bun install` on the release commit changes nothing.

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

## Tagged projects and new ones

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

## First publish of a new package

OIDC trusted publishing cannot make a package's first publish, because npm cannot attach a trusted
publisher to a package that does not exist yet. So the first release authenticates with a
short-lived token that only the workflow's first-release step sees. If a releasable project has no
tag and `NPM_TOKEN` is unset, the workflow fails before it versions, tags or pushes anything, and
names the project. (`theme-thrifty-paper` was the first package to go through this.)

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

From then on the workflow releases it through OIDC whenever it has releasable commits, and npm
attaches provenance for a public repository. Nx reads only a root `tsconfig.base.json` or `tsconfig.json`, and
TypeScript 7 has no classic compiler API for it to parse them with, so the shared compiler options
live in `tsconfig.shared.json` instead.

