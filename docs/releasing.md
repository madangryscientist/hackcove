# Releasing

Maintainer notes for publishing the `@slashsuite/*` packages. Contributors do not need any of this: a
release is started by a maintainer, from Actions, whenever one is needed. Every release is a
pre-release: versions stay `0.x`.

Releases are change-driven. `nx release` looks at the commits since each package's last tag
(`<project>@<version>`), bumps only the packages that changed, writes each one's `CHANGELOG.md`,
commits and tags the release, pushes, creates a GitHub release, and publishes. The commit rules
it reads are in [CONTRIBUTING.md](../CONTRIBUTING.md#commit-messages). Nothing publishes on a push: a release starts from Actions.
Publishing goes through Nx, never a bare `npm publish`.

Nx is in this repo for releasing alone: moon runs every task, the release workflow's gate included,
and Nx keeps only `nx release` (`nx.json` holds its `release` block and the publish executor, and
each package's `nx.name` keeps the project names its tags use).

## From CI (GitHub Actions)

`.github/workflows/publish.yml` is the only thing that publishes: no one publishes from a laptop,
not even a package's first version. It is a manual workflow (Actions → Publish → Run workflow, from
`main`). It runs the gate, then `nx release`. Two inputs:

- `dry_run` (default on) versions and previews changelogs, and publishes nothing. No commit, tag,
  push or GitHub release happens either. Untick it to release for real.
- `project` (optional) is only for deliberately releasing one project on its own, such as `ui-react` (a
  re-publish after a failed first publish, say). A release is started with it empty, which releases
  every releasable project (`release.projects` in `nx.json`). One run per project buys extra gate
  runs and separate release commits, and each run versions only its own project, so a package
  changed in the same commit is missed.

Already-released packages authenticate with npm trusted publishing (OIDC), so there is no
`NPM_TOKEN` and no OTP in their step. A package's first version is staged instead, and the
maintainer approves it on npmjs.com ("First publish of a new package"). `nx.json` sets `cli.packageManager` to `npm`, so the publish
step (Nx's `@nx/js:release-publish` executor) runs `npm publish` rather than `bun publish`: bun
cannot do npm trusted publishing or prompt for an OTP. The release commit and tags are pushed with
the job's `GITHUB_TOKEN` (`contents: write`), so `main` must accept pushes from GitHub Actions.
One-time setup, by hand:

1. On GitHub, create an environment named `npm-publish` (Settings → Environments) and limit its
   deployment branches to `main`. It has no required reviewer while the packages are `0.x`: a
   dispatch from `main` publishes without an approval step. Add one if you want a gate on every
   publish.
2. On npmjs.com, for each package that is already on npm (`@hackcove/ui-react` today; a new
   package's publisher is added after its first publish, below): Settings → Trusted Publisher →
   GitHub Actions, repository `slashsuite/uislash`, workflow filename `publish.yml`,
   environment `npm-publish`.

The release commit also carries `bun.lock`. The workspace entries in it hold each package's version, so
`scripts/release-version-actions.cjs` (`release.version.versionActions` in `nx.json`) runs
`bun install --lockfile-only` after the bump and Nx stages the file. Nx's own refresh is not used: it
follows `cli.packageManager`, which must stay `npm` for the publish step, and would run
`npm install --package-lock-only`. After a release, `bun install` on the release commit changes nothing.

Nx pushes the release commit, the tags and the GitHub release before it runs `npm publish`. If the
publish then fails, a re-run finds nothing new to release. Fix the cause and land a releasable
commit: the next run publishes the next version. A stranded version is never published by hand.
The exception is a first publish: its tag exists from the moment Nx pushes, so a failed staging
(wrong token scope, expired token) leaves a project with a tag and nothing on npm. The workflow
files it as *staged* and skips it with a notice, as if it waited for approval. If Staged Packages
on npmjs.com does not list it, delete the tag (`git push origin :refs/tags/<project>@<version>`)
and the GitHub release, revert the release commit, and start the first-release steps again. A dry
run does not exercise the token, so it cannot catch this.

Locally, the same dry run of the tagged projects is:

```sh
bunx nx release --dry-run --projects ui-react   # the tagged projects, see below
```

A project with no tag yet cannot be resolved that way (Nx has no base tag). Check a new package's
first publish with its on-disk version instead, which plans the same release the workflow's
"First release" step makes:

```sh
bunx nx release 0.1.0 --first-release --projects themes --dry-run
```

## Tagged projects and new ones

The workflow sorts the releasable projects by their tags on origin and by what npm has approved (its
"Pick" step, `scripts/releasePick.ts`, tested in `packages/themes-shared`). npm's `0.0.0-stage`
placeholder, which npm publishes when a brand-new package is staged, does not count as approved:

- **Tagged** (a `<project>@<version>` tag exists and the package is on npm): released by conventional
  commits, as above, through OIDC.
- **New** (no such tag): its first publish, in its own step ("First release"), at the version
  already in its `package.json`. Nothing about which projects are new is listed anywhere; it is
  computed from tags.
- **Renamed** (a tag exists, cut under another package name, and nothing is approved on npm): see
  "Renaming a package". Released by conventional commits and staged with `NPM_TOKEN` like a first
  publish.
- **Staged** (a tag exists, cut under this package name, and nothing is approved on npm): an earlier
  run staged its first version and it waits for the maintainer. The run skips it with a notice, so
  a dispatch while it waits neither fails nor bumps it again. Once approved, it is *tagged*.

Nx's `git-tag` version resolver refuses a project with no tag, which is why *new* is a separate Nx
invocation. The first-release step runs `nx release <version-on-disk> --first-release --projects
<project> --skip-publish` once per new project: `--first-release` falls back to the version on disk
and starts the changelog at the first commit, and the explicit specifier keeps conventional commits
from bumping it. It tags `<project>@<version>`, writes `CHANGELOG.md`, pushes and creates the GitHub
release; then `npm stage publish` stages that version. Because it now has a tag, the project is
*staged* from the next run on, and *tagged* once its version is approved. New, renamed and tagged
projects can be in the same run, in that order.

## First publish of a new package

OIDC trusted publishing cannot make a package's first publish, because npm cannot attach a trusted
publisher to a package that does not exist yet. So the workflow **stages** the first version with
`npm stage publish` (npm 11.15.0 or newer), authenticated by `NPM_TOKEN`, a granular token that does
not bypass 2FA: it may stage, but a plain `npm publish` with it stops at npm's OTP prompt. Nothing
is public until the maintainer approves the staged version with 2FA on npmjs.com. Nx's publish
executor can only run `npm publish`, so the two NPM_TOKEN steps run `nx release --skip-publish` (the
version, changelog, tag, push and GitHub release) and then stage the package folder themselves. The
token is written to a private `.npmrc` outside the checkout that the step removes on exit, and no
other step sees it. If a project needs staging and `NPM_TOKEN` is unset, the workflow fails before
it versions, tags or pushes anything, and names the project.

1. On npmjs.com, make a granular access token: "Read and write (publish and stage)" on the
   `@slashsuite` packages (the token must cover the new scope), bypass 2FA off. (npm's changelog of 2026-07-08: tokens that bypass 2FA
   stop publishing directly around January 2027; staging needs no bypass.)
2. `gh secret set NPM_TOKEN --env npm-publish` (paste the token when prompted).
3. Run the workflow with `dry_run` on and read the log: the version (`0.1.0`), the tag
   (`oxlint-testing@0.1.0`), the changelog, the GitHub release it would create, and
   `npm stage publish`'s tarball listing. Then run it again with `dry_run` off. npm publishes a
   `0.0.0-stage` placeholder version of a brand-new package alongside the staged one.
4. **Approve it**: on npmjs.com, open the package's **Staged Packages** tab, review the staged
   version and click **Approve**; npm asks for your 2FA (or `npm stage approve <stage-id>`). Until
   then later runs skip the project (*staged*), and a run started meanwhile neither fails on it
   nor bumps it again.
5. Add the trusted publisher for the package (workflow `publish.yml`, environment `npm-publish`),
   or `npm trust github …`.

From then on the workflow releases it through OIDC whenever it has releasable commits, and npm
attaches provenance for a public repository. The token stays on the environment for the next new
package until it expires; replace it before then, and revoke it on npmjs.com if it is no longer
wanted.

## Renaming a package

A rename is a new npm package with an old history. `@hackcove/ui` became `@hackcove/ui-react` in
`packages/ui-react` (Nx project `ui-react`), in one breaking commit
(`feat(ui-react)!: rename @hackcove/ui to @hackcove/ui-react`), with no alias package and no
re-export shim (pre-1.0 changes break directly). The version in `package.json` is left where the old
package ended (`0.7.1`), so the release computes it: a `!` while `0.x` is a minor bump, `0.8.0`.

Nx finds a project's last release by its tag, `<project>@<version>`, and the tags of the old project
(`ui@…`) mean nothing to the new one. Rather than a version override, the release keeps its normal
rules and the new name inherits the old name's last tag. That makes `nx release` compute the bump
from the commits since the old package's last release and write a changelog that continues, not one
that restarts at the first commit.

1. **Tag, after the rename merges** (the architect; the rename PR does not push tags). Put the new
   name's tag on the commit the old name's last tag points at, and push only that tag:

   ```sh
   git fetch origin --tags
   git tag -a ui-react@0.7.1 -m ui-react@0.7.1 'ui@0.7.1^{commit}'
   git push origin ui-react@0.7.1
   ```

   Leave the old `ui@…` tags and GitHub releases alone: they are the history of `@hackcove/ui`.
2. **Check**: `bunx nx release --dry-run --projects ui-react` must print `0.8.0`, a tag
   `ui-react@0.8.0`, and a changelog that starts after `ui-react@0.7.1`.
3. **First publish is staged.** The new name is not on npm, so OIDC cannot publish it (see
   "First publish of a new package"). The workflow sees a project whose last tag was cut under the
   old name and that npm does not have, files it under *renamed* and runs it in the "Release
   (renamed projects, staged with NPM_TOKEN)" step, which bumps it by conventional commits and stages
   the new version; with no token it stops before it versions anything. Run a dry run first, then
   the real release, then approve the staged version on npmjs.com as in step 4 there.
4. **Trusted publisher, afterwards.** On npmjs.com add the trusted publisher for
   `@slashsuite/ui-react` (workflow `publish.yml`, environment `npm-publish`). From then on the
   package is *tagged* and goes through OIDC.
5. **The old package.** `@hackcove/ui` stays on npm at `0.7.1`; whether to `npm deprecate` it, with a
   message pointing at `@slashsuite/ui-react`, is the maintainer's call, made after the first
   `ui-react` release. Its trusted publisher is no longer needed.

For the next rename of a published package: rename the folder, the `name` and the Nx project name in
the same commit as a `!` commit, add the tag copy above, and follow 2 to 5.

A move of scope (`@hackcove` to `@slashsuite`) is a rename that keeps the project name. The folder, the moon and Nx project name and the tags (`ui-react@0.11.3`) stay, so no tag copy is needed: the next release computes its bump from the commits since the last tag, and the workflow files the package as renamed and stages it under the new scope. The `@slashsuite` npm org has to exist (it does, created 2026-11-19) and the token has to cover the new scope, not only the old one, or the staging step fails before it versions anything.
