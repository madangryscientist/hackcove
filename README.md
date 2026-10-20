# @hack-cove/themes

The Hack Cove design system: a **Catppuccin Mocha dark theme layer** for Tailwind v4, plus the
small React components and typography roles written against it.

Status: `0.x`, not yet published to npm. License: undecided (see `LICENSE`).

## Install

```sh
bun add @hack-cove/themes
# peers: react >= 18, tailwindcss ^4
```

## Use

In your app's global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@hack-cove/themes/theme.css";

/* The components use Tailwind utilities, and Tailwind skips node_modules, so point it at the
   package's build. The path is relative to this stylesheet. */
@source "../node_modules/@hack-cove/themes/dist";
```

Put `class="dark"` on `<html>`. `theme.css` declares the class-based `dark` variant and remaps the
slate/colour utilities the components use to real Mocha tokens under `.dark`.

```tsx
import { Card, Pill, PageHeading, Body } from "@hack-cove/themes";

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

Use it from a checkout before publishing with a `link:` dependency
(`"@hack-cove/themes": "link:../hack-cove-themes"`), and rebuild (`bun run build`) after changes.

The package name lives in `package.json` alone. If the `@hack-cove` npm scope turns out to be
taken, change `name` there (fallback: `hack-cove-themes`) and update the occurrences in this README;
`src/package.test.ts` fails on any other scoped name left behind.
