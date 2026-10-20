# @hackcove/themes

The Hack Cove design system: a **Catppuccin Mocha dark theme layer** for Tailwind v4, plus the
small React components and typography roles written against it.

Status: `0.x`, not yet published to npm. License: undecided (see `LICENSE`).

## Install

```sh
bun add @hackcove/themes
# peers: react >= 18, tailwindcss ^4
```

## Use

In your app's global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@hackcove/themes/theme.css";

/* The components use Tailwind utilities, and Tailwind skips node_modules, so point it at the
   package's build. The path is relative to this stylesheet. */
@source "../node_modules/@hackcove/themes/dist";
```

Put `class="dark"` on `<html>`. `theme.css` declares the class-based `dark` variant and remaps the
slate/colour utilities the components use to real Mocha tokens under `.dark`.

```tsx
import { Card, Pill, PageHeading, Body } from "@hackcove/themes";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Body>Two things shipped.</Body> <Pill tone="emerald">ok</Pill>
  </Card>
);
```

### What is exported

- `theme.css`: the token layer (surfaces, text, borders, accents, `.link`).
- Primitives: `Card`, `EpicHeader`, `Empty`, `PageTitle`, `Pill`, `groupByEpic`, `Markdown`.
- Typography roles (each pins size + weight, takes a `color` and an `as`): `Display`, `Lead`,
  `PageHeading`, `SectionHeading`, `SubsectionHeading`, `ModalHeading`, `Subtitle`, `Overline`,
  `Body`, `BodyStrong`, `Caption`.

## Develop

```sh
bun install
bun run typecheck && bun run lint && bun run format:check && bun run test
bun run build          # dist/ (ESM + .d.ts, theme.css copied as-is)
bun run pack:check     # build, then `npm pack --dry-run`: the tarball is dist/ + package.json + README + LICENSE
bun run storybook      # the visual reference, http://localhost:6006
```

Use it from a checkout before publishing: run `bun link` once in this repo, then
`bun link @hackcove/themes` in the consumer (it writes `"@hackcove/themes": "link:@hackcove/themes"`).
Rebuild (`bun run build`) after changes; consumers read `dist/`.

The package name lives in `package.json` alone. If the name ever changes, edit `name` there and the
occurrences in this README; `src/package.test.ts` fails on any other scoped name left behind.
