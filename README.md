# hackcove

The Hack Cove design system, as an Nx + Bun-workspaces monorepo. Every package here is published
on its own; nothing is published yet.

| Folder | Package | What it is |
| --- | --- | --- |
| `packages/ui` | `@hackcove/ui` | The React components: primitives, typography roles, a safe Markdown renderer. Written against Tailwind v4 utilities. No theme CSS. |
| `themes/catppuccin-mocha` | `@hackcove/theme-catppuccin-mocha` | The Catppuccin Mocha dark theme: one `theme.css` that remaps those utilities under `.dark`. |
| `apps/storybook` | (private) | Storybook for the components, with a toolbar theme switcher that lists every folder under `themes/`. |

There is **no light theme package**. The light look is the components' own default Tailwind classes
and has no CSS of its own; Storybook's `default` choice shows it.

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
2. Edit `theme.css`. The contract: remap the utilities `@hackcove/ui` uses under a `.dark` scope,
   declare `@custom-variant dark (&:where(.dark, .dark *));`, and do not import Tailwind (the
   consumer does).
3. Rewrite `README.md` and the LICENSE placeholder for the new package.
4. `bun install`, then `bunx nx run theme-<name>:test` (checks the name, exports, `files` list and
   the `.dark` scope in the theme's own `theme.test.ts`; edit it to match your theme).

There is nothing else to register. Storybook finds `themes/*/theme.css` on its own, so the new
theme is in the toolbar the next time it starts.

## Develop

Everything goes through Nx:

```sh
bun install
bunx nx run-many -t typecheck lint test build   # the gate
bun run format:check                            # oxfmt, workspace-wide
bunx nx run-many -t pack-check                  # npm pack --dry-run per package
bunx nx run storybook:storybook                 # http://localhost:6006
```

Use the packages from a consumer checkout before they are published: run `bun link` once inside
`packages/ui` and each `themes/<name>`, then `bun link @hackcove/ui` (and the theme) in the
consumer. Rebuild `packages/ui` (`bunx nx build ui`) after a change; consumers read its `dist/`.
