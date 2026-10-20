# @hackcove/ui

Hack Cove React components, written against Tailwind v4 utilities. They carry no theme: pair them
with a `@hackcove/theme-*` package such as `@hackcove/theme-catppuccin-mocha`, or use them on their
own for the default light look.

Status: `0.x`, not yet published to npm. License: MIT.

## Install

```sh
bun add @hackcove/ui
# peers: react >= 18, tailwindcss ^4
```

Tailwind skips `node_modules`, so tell it to scan the build for the utilities the components use,
in the stylesheet that imports Tailwind (the path is relative to that file):

```css
@import "tailwindcss";
@source "../node_modules/@hackcove/ui/dist";
```

## Use

```tsx
import { Body, Card, PageHeading, Pill } from "@hackcove/ui";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Body>Two things shipped.</Body> <Pill tone="emerald">ok</Pill>
  </Card>
);
```

## What is exported

- Primitives: `Card`, `EpicHeader`, `Empty`, `PageTitle`, `Pill`, `groupByEpic`, `Markdown`.
- Typography roles (each pins size + weight, takes a `color` and an `as`): `Display`, `Lead`,
  `PageHeading`, `SectionHeading`, `SubsectionHeading`, `ModalHeading`, `Subtitle`, `Overline`,
  `Body`, `BodyStrong`, `Caption`.

## Develop

From the workspace root: `bunx nx run-many -t typecheck lint test build -p ui` and
`bunx nx pack-check ui` (the tarball is `dist/` plus `package.json`, `README.md`, `LICENSE`).
The stories live in `apps/storybook`.
