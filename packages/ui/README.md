# @hackcove/ui

Hack Cove React components, written against Tailwind v4 utilities. They carry no theme: pair them
with a `@hackcove/theme-*` package such as `@hackcove/theme-catppuccin-mocha`, or use them on their
own for the default light look.

Status: `0.x`, published to npm. License: MIT.

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
- Controls: `Button`, `buttonClass` (the classes of a `Button`, for a router's own `<Link>`), `IconButton` (a square button holding one icon; `label` is required and becomes its `aria-label` and `title`), `ColourSchemeToggle` (a light/dark switch on `<html>`; see Light and dark), `Input` (a text input; `icon` adds a leading icon inside the field), `Textarea` (a multi-line text input, `rows` defaults to 3), `Select` (a native `<select>` in the control look; takes `<option>` children and keeps the browser's arrow). `Checkbox` (a native checkbox with its label; `className` goes on the label, other props on the input). `CopyButton` (a small text button that writes `text` to the clipboard and swaps `label` ("copy") for `copiedLabel` ("copied"); every other button prop, `disabled` included, goes on the `<button>`). `CopyLine` (one line of mono text in a box with a `CopyButton` beside it; other props go on the root `<div>`). `Field` (a label above a control, `htmlFor` names the control's id; a `hint` sits under it, and an `error` replaces the hint with a `role="alert"` line). `Callout` (a tinted notice box; `tone` is `neutral`, `info` (default), `positive`, `warn` or `danger`; an optional `title` sits in bold above the body). `NavTabs` (a row of pill links in a `<nav>`; `items` are `{ label, href, active? }`, `label` names the landmark, the active one is filled and gets `aria-current="page"`). `navTabClass` (the classes of one tab, for a router's own `<Link>`). `Breadcrumbs` (a `<nav aria-label="Breadcrumb">` over an ordered list; `crumbs` are nodes, the last is the current page and gets `aria-current="page"`, and each crumb truncates). `crumbLinkClass` (the classes of a crumb that links, for a router's own `<Link>`). `KeyValueList` (a `<dl>` of label/value rows; each `KeyValue` takes a `label` and its value as children, the value right-aligned in tabular figures). `Avatar` (a round badge of the initials of `name`, titled with the name and `aria-hidden`; `size` is `sm`, `md` (default) or `lg`; `ring` adds a page-colour border and a negative margin for an overlapping stack; the colour is one of seven stock background classes picked by a hash of the name, remapped by each theme, and `avatarColourClass(name)` returns it to colour something else the same way; `initialsOf(name)` is the two letters). `Kbd` (a keyboard key in mono; its border takes the surrounding text colour, so it reads on a filled button too). `ToggleChip` (an on/off filter pill; `pressed` sets `aria-pressed` and the filled look, `dot` adds a leading colour dot, and the caller toggles it in `onClick`). `FilterGroup` (a `<fieldset>` with a small uppercase `legend` over a wrapped row of its children, e.g. `ToggleChip`s; `className` goes on the fieldset).

## Light and dark

A dark theme does its colour work under `.dark`; this only decides whether `.dark` is on `<html>`.
Two states, light and dark. The stored choice wins; with nothing stored the system's
`prefers-color-scheme` decides. Which dark theme is loaded stays your CSS import.

1. **Inline `colourSchemeScript` in `<head>`**, before the stylesheet, so the class is right at
   first paint and a light user gets no dark flash. It is a few hundred bytes of plain JavaScript:

   ```tsx
   import { colourSchemeScript } from "@hackcove/ui";

   <head>
     <script dangerouslySetInnerHTML={{ __html: colourSchemeScript }} />
   </head>;
   ```

   In Astro, use `<script is:inline set:html={colourSchemeScript} />`.

2. **Drop the hard-coded `class="dark"`** from `<html>`. The script sets and removes it (and
   `color-scheme`, so native controls and scrollbars follow). For a server-rendered `<html>`, add
   `suppressHydrationWarning` (React) because the script changes its `class` before React hydrates.

3. **Place the toggle** wherever the header wants it:

   ```tsx
   import { ColourSchemeToggle } from "@hackcove/ui";

   <ColourSchemeToggle className="ml-auto" onChange={(scheme) => track(scheme)} />;
   ```

   It is an `IconButton` showing the scheme you would switch *to* (a sun on a dark page, a moon on a
   light one), labelled "Switch to light theme" / "Switch to dark theme". A click applies the scheme
   to `<html>` and stores it under `localStorage["hackcove:colour-scheme"]`; a storage error (private
   mode) is swallowed and the page still switches. It reads the current state from the `dark` class
   when it mounts, so it agrees with the script and renders the same on the server and the client.

Without React, `applyColourScheme(scheme, root?)`, `readColourScheme(fallback?)` and
`storeColourScheme(scheme)` are exported too; `ColourScheme` is `"light" | "dark"`.

## Palette

`palette.json` (in the repo, not in the package) lists the colour utilities the components may use,
by role.

| Role       | For                                                                   |
| ---------- | --------------------------------------------------------------------- |
| `surface`  | Cards and panels: the main background.                                |
| `subtle`   | A step off the surface: table stripes, hover rows.                    |
| `inset`    | A step deeper: wells, chips, pressed fills.                           |
| `line`     | Borders and dividers.                                                 |
| `ink`      | Text, from primary down to muted, plus input placeholders.            |
| `accent`   | Primary actions, links, focus rings and controls; text on the accent. |
| `positive` | Success: fill, text and border.                                       |
| `warn`     | Caution: fill, text and border.                                       |
| `danger`   | Errors and destructive actions: fill, text and border.                |
| `info`     | Neutral notes: fill, text and border.                                 |

A theme remaps every utility in `palette.json`; a component uses no colour utility outside it.

## Develop

From the workspace root: `bunx nx run-many -t typecheck lint test build -p ui` and
`bunx nx pack-check ui` (the tarball is `dist/` plus `package.json`, `README.md`, `LICENSE`).
The stories live in `apps/storybook`.
