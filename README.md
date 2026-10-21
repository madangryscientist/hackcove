# hackcove

The Hack Cove design system, as an Nx + Bun-workspaces monorepo. Every package here is published
on its own; `0.1.0` of `@hackcove/ui` and the Mocha theme is on npm (MIT).

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

Publishing goes through Nx, never a bare `npm publish`. After `npm login` to the `hackcove` org
(2FA, or a granular token that bypasses it):

```sh
bunx nx release publish --dry-run   # builds, then `npm publish --dry-run` per package; publishes nothing
bunx nx release publish             # builds, then publishes @hackcove/ui and every theme, access public
```

Add `-p ui` or `-p theme-<name>` to publish one package. Versions are bumped by hand in each
`package.json` (0.x). The `nx-release-publish` target is Nx's own `@nx/js:release-publish` executor
(`nx.json`). `nx.json` sets `cli.packageManager` to `npm`, so the executor runs `npm publish` rather
than `bun publish`: bun cannot do npm trusted publishing or prompt for an OTP.

### From CI (GitHub Actions)

`.github/workflows/publish.yml` is a manual workflow (Actions → Publish → Run workflow, from
`main`). It runs the gate, then `nx release publish`, and defaults to a dry run; untick `dry_run`
to publish. It authenticates with npm trusted publishing (OIDC), so there is no `NPM_TOKEN` and no
OTP. One-time setup, by hand:

1. On GitHub, create an environment named `npm-publish` (Settings → Environments); add a required
   reviewer if you want a gate on every publish.
2. On npmjs.com, for each package (`@hackcove/ui`, `@hackcove/theme-catppuccin-mocha`): Settings →
   Trusted Publisher → GitHub Actions, repository `madangryscientist/hackcove`, workflow filename
   `publish.yml`, environment `npm-publish`.

A trusted publisher can only be added to a package that already exists, so the first publish of
each new package has to be made locally (`bunx nx release publish -p <project>` with a granular
token that bypasses 2FA, since the executor cannot prompt for an OTP; delete the token afterwards);
every later one goes through the workflow. `0.1.0` of both packages was published that way, and both
have the trusted publisher above (it shows "pending validation" until the workflow's first real
publish). npm stages a brand-new package's first publish, so a `0.0.0-stage` placeholder version
exists alongside `0.1.0`. Provenance is only
attached for public repositories. Nx reads only a root `tsconfig.base.json` or `tsconfig.json`, and TypeScript 7 has no
classic compiler API for it to parse them with, so the shared compiler options live in
`tsconfig.shared.json` instead.

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
