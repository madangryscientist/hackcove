# hackcove — repo conventions

The Hack Cove design system: React components (`@hackcove/ui`) and one folder per theme
(`@hackcove/theme-<name>`), each its own npm package, in an Nx + Bun-workspaces monorepo.
`README.md` is the user-facing contract (install, usage, how to add a theme).

Extracted from omnibus on 2026-10-20 (ob 1501, decision #70). History before that commit is
omnibus's `platform/ui`. Its consumers are omnibus's `apps/dashboard` and `apps/hack-cove-site`.

This file is the operating agreement for agents working here. The `ob-planner` skill reads it in
Step 0 to learn this repo's tracker, gate and landing convention — keep it accurate or the planner
will adapt to a stale repo.

## Tracker: `ob` only

The repo has a remote — `origin`, `github.com/madangryscientist/hackcove`, **private** — and `gh`
is authenticated, so `gh issue` would work. We do not use it: one tracker is better than two, and
`ob` is where the planning, spinoff and landing workflow lives. Do not create GitHub issues unless
a human asks for them.

- Tickets live in `ob`, project **`hackcove`**. Create with
  `ob add "<title>" --project hackcove --body "<brief>"`.
- Refer to tickets **by name**, not bare ids, in anything a human reads.
- Put the brief in the item's **body**. `ob spinoff brief` reads `wayfinder/tickets/<ref>-*.md`
  only in omnibus; here there is no such directory, so the brief falls back to the item's title +
  body. That fallback is the mechanism — use it.

Write each brief with these three headings, because the builder's launch prompt is built from them:

```
## What to build
## Acceptance
## Do not
```

`## Do not` is where you fence scope: files out of bounds, things that must not be refactored,
"do not add a dependency for this".

## Layout

| Project | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | `@hackcove/ui`: the components. Builds to `dist/` (ESM + `.d.ts`). Peers: react, tailwindcss v4. No theme CSS. |
| `theme-catppuccin-mocha` | `themes/catppuccin-mocha` | `@hackcove/theme-catppuccin-mocha`: one `theme.css`, shipped as-is. |
| `storybook` | `apps/storybook` | Storybook for the components; a toolbar switcher lists every `themes/*` folder. Private. |

**One folder, one publishable package per theme.** Adding a theme is copying a folder
(`README.md`, "How to add a theme"); nothing else registers it. There is no light theme package:
the light look is the components' default Tailwind classes, with no CSS of its own.

## The gate

Everything runs through Nx (the standard stack: `skills/ob-new-project/STANDARD-STACK.md` in
omnibus — Bun, strict tsconfig, oxlint + oxfmt, Vitest). A change is green when all of these pass
**from the worktree**:

```bash
bun install                                        # a fresh worktree has no node_modules
bunx nx run-many -t typecheck lint test build      # tsc strict · oxlint --type-aware --deny-warnings + check-slop · Vitest · dist + Storybook build
bun run format:check                               # oxfmt --check  (`bun run format` fixes)
bunx nx run-many -t pack-check                     # npm pack --dry-run for every package
```

`bunx nx affected -t ...` for just what changed; `--skip-nx-cache` to force a rerun. Lint rules are
all errors; fix the code, do not disable a rule. A change to a component or a `theme.css` also gets
a look: `bunx nx run storybook:storybook`, flip the theme switcher, and read the stories.

**The consumers.** Every class a component uses and every utility a theme remaps shows up in
omnibus's dashboard and `hack-cove-site`. After such a change, rebuild (`bunx nx build ui`) and
build those two apps in an omnibus worktree (`bunx nx build dashboard`, `bunx nx build
hack-cove-site`) and compare the CSS before and after. The omnibus apps use `link:@hackcove/ui` and
`link:@hackcove/theme-catppuccin-mocha` (bun's global link registry: `bun link` once inside each
package here), so they read this checkout's `dist/` until the packages are published.

## Landing: no PRs

Implementation lands on a branch, the builder commits with a trailing `State:` line, and the
planner gates and squash-merges with `ob-land`.

1. Builder commits on its own branch, ending the message with one of
   `State: ready` / `State: needs-human` / `State: blocked` / `State: partial`.
2. The builder never pushes, never merges and **never publishes**.
3. On `State: ready`, the planner loads `ob-land` and lands it into `main`. Landing is what
   touches the remote, and it is the only step that does:

   ```bash
   git push origin main
   git push origin --delete <branch>   # only after the squash is on main
   ```

Scan several worktrees without opening a diff:

```bash
git log --format='%s%n%b' main..<branch>
```

Never commit implementation straight to `main`. Never `git commit -am` — stage new files
explicitly or they are silently dropped.

## Dispatch

`ob spinoff <ref>` enqueues a launch; the daemon drains it in-session. Dispatch is always
interactive and `--agent` is a usage error. `ob config` routes `spinoff_launcher_by_repo` →
`hackcove: t3`, so a spinoff opens a **T3 Code thread** in this repo's T3 project (workspace root
`~/dev/hackcove`), bound to the ob-owned worktree. A fresh spinoff worktree has no `node_modules`;
`bun install` is the builder's first step.

The planner itself is the pinned T3 thread `planner · hackcove`, created by
`ob t3 planner --repo hackcove` (idempotent: a re-run reads the same thread back and creates
nothing).

## Repo invariants

1. **`@hackcove/ui` carries no theme.** Components are written against stock Tailwind utilities
   (`bg-white`, `text-slate-900`, …) and never contain a `dark:` variant or a palette colour. A
   theme is the only place a palette lives, and it remaps those utilities under `.dark`.
2. **A theme is a folder and nothing else registers it.** No theme name appears in code: Storybook
   globs `themes/*/theme.css`, and each theme's own `theme.test.ts` is the contract (name
   `@hackcove/theme-<folder>`, exports + `files` = `theme.css` only, `@custom-variant dark`,
   rules scoped under `.dark`, no Tailwind import). Do not add a theme list anywhere.
3. **Packages stay dependency-free at runtime.** `@hackcove/ui` has only peers (react, tailwindcss
   v4); a theme has only the tailwindcss peer. A new dependency is a human decision.
4. **`packages/ui` source imports use `.js` specifiers** (`./ui.js`, resolved to the `.tsx`). A
   `.tsx` specifier is emitted into the `.d.ts` unchanged and points at a file `dist` does not
   have, which silently breaks consumers' types.
5. **Nothing is published without Jacobus, and only the planner pushes.** No `npm publish`; no
   `git push` from a builder. The repo stays private. `LICENSE` is a placeholder until he chooses
   one; versions stay `0.x`.
