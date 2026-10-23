# @hackcove/ui

Hack Cove React components, written against Tailwind v4 utilities. They carry no theme: pair them
with a `@hackcove/theme-*` package such as `@hackcove/theme-catppuccin-mocha`, or use them on their
own for the default light look.

Status: `0.x`, published to npm. License: MIT.

## Install

```sh
bun add @hackcove/ui
# peers: react >= 18, react-dom >= 18, tailwindcss ^4
```

One runtime dependency comes with it: `react-aria-components` (and `@internationalized/date`),
for `DatePicker` and `DateField`. It brings no CSS; the classes are ours.

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

- Primitives: `Card`, `EpicHeader`, `Empty`, `PageTitle` (deprecated: use `PageHeader`), `Pill`, `groupByEpic`, `Markdown`.
- Layout (see Layout): `AppShell`, `appShellRootClass`, `Container`, `PageHeader`, `Stack`, `Section`, and the page layouts `ListLayout`, `DetailLayout`, `FormLayout`, `CardGrid`, `SidebarLayout`, `FullBleedLayout`, `CenteredLayout`.
- Typography roles (each pins size + weight, takes a `color` and an `as`): `Display`, `Lead`,
  `PageHeading`, `SectionHeading`, `SubsectionHeading`, `ModalHeading`, `Subtitle`, `Overline`,
  `Body`, `BodyStrong`, `Caption`.
- Controls: `Button`, `buttonClass` (the classes of a `Button`, for a router's own `<Link>`), `IconButton` (a square button holding one icon; `label` is required and becomes its `aria-label` and `title`), `ColourSchemeToggle` (a light/dark switch on `<html>`; see Light and dark), `Input` (a text input; `icon` adds a leading icon inside the field), `Textarea` (a multi-line text input, `rows` defaults to 3), `Select` (a native `<select>` in the control look; takes `<option>` children and keeps the browser's arrow). `Checkbox` (a native checkbox with its label; `className` goes on the label, other props on the input). `CopyButton` (a small text button that writes `text` to the clipboard and swaps `label` ("copy") for `copiedLabel` ("copied"); every other button prop, `disabled` included, goes on the `<button>`). `CopyLine` (one line of mono text in a box with a `CopyButton` beside it; other props go on the root `<div>`). `Field` (a label above a control, `htmlFor` names the control's id; a `hint` sits under it, and an `error` replaces the hint with a `role="alert"` line). `Callout` (a tinted notice box; `tone` is `neutral`, `info` (default), `positive`, `warn` or `danger`; an optional `title` sits in bold above the body). `NavTabs` (a row of pill links in a `<nav>`; `items` are `{ label, href, active? }`, `label` names the landmark, the active one is filled and gets `aria-current="page"`). `navTabClass` (the classes of one tab, for a router's own `<Link>`). `Breadcrumbs` (a `<nav aria-label="Breadcrumb">` over an ordered list; `crumbs` are nodes, the last is the current page and gets `aria-current="page"`, and each crumb truncates). `crumbLinkClass` (the classes of a crumb that links, for a router's own `<Link>`). `KeyValueList` (a `<dl>` of label/value rows; each `KeyValue` takes a `label` and its value as children, the value right-aligned in tabular figures). `Avatar` (a round badge of the initials of `name`, titled with the name and `aria-hidden`; `size` is `sm`, `md` (default) or `lg`; `ring` adds a page-colour border and a negative margin for an overlapping stack; the colour is one of seven stock background classes picked by a hash of the name, remapped by each theme, and `avatarColourClass(name)` returns it to colour something else the same way; `initialsOf(name)` is the two letters). `Kbd` (a keyboard key in mono; its border takes the surrounding text colour, so it reads on a filled button too). `ToggleChip` (an on/off filter pill; `pressed` sets `aria-pressed` and the filled look, `dot` adds a leading colour dot, and the caller toggles it in `onClick`). `FilterGroup` (a `<fieldset>` with a small uppercase `legend` over a wrapped row of its children, e.g. `ToggleChip`s; `className` goes on the fieldset). `DatePicker` and `DateField` (see Dates).
- Dates: `toISODate`, `fromISODate`, and the `CalendarDate` type.

## Dates

```tsx
import { DatePicker, fromISODate, toISODate, type CalendarDate } from "@hackcove/ui";

<DatePicker
  label="Date of birth"
  description="DD/MM/YYYY"
  defaultValue={fromISODate("1990-05-17")}
  maxValue={fromISODate("2026-10-23")}
  onChange={(date: CalendarDate | null) => save(toISODate(date))}
  name="dob"
  isRequired
/>;
```

- `DatePicker` is a segmented DD/MM/YYYY field (always en-GB, whatever the browser's locale) with a
  calendar button. The popover has ‹ › month steps, month and year dropdowns, Monday-first weeks
  and a Clear action. `defaultOpen` opens it on mount.
- `DateField` is the same field without the calendar.
- Both take `label`, `description`, `errorMessage`, `value` / `defaultValue` / `onChange`,
  `minValue`, `maxValue`, `isDisabled`, `isRequired` and `name` (the form posts `YYYY-MM-DD`).
  Values are `CalendarDate`s (from `@internationalized/date`, re-exported as a type).
- `toISODate(date)` gives `"1990-05-17"` (`""` for `null`); `fromISODate(text)` gives a
  `CalendarDate`, or `null` for a malformed or impossible date such as `"1990-02-31"`.
- `onChange` reports what the field shows: the date once it is complete, exists and is within
  `minValue` / `maxValue`. When a valid date is edited into one that is not, it reports `null` once
  and `name` posts `""`, so a controlled parent holds `null` until the date is fixed (holding it does
  not clear what was typed). Fixing it reports the date again. A `value` the parent sets is shown,
  not reported back.
- With `isRequired`, a partly filled date blocks the form and shows "Enter the whole date." once
  the field loses focus.
- A date before `minValue` or after `maxValue` stays as typed (it is never clamped) and shows the
  error once the field loses focus.
- An impossible date such as 31/02/1990 shows "February 1990 has 28 days." and stays exactly as
  typed, focus leaving included, until it is fixed. `errorMessage` replaces either message.

## Layout

One content edge for every page, so nothing moves sideways between pages or viewport sizes.

```tsx
import { AppShell, PageHeader, Section, Stack, appShellRootClass } from "@hackcove/ui";

// Your root layout. `appShellRootClass` is `overflow-y-scroll`: it reserves the scrollbar, so a
// short page and a long one centre their content at the same x. AppShell cannot set it itself.
<html className={appShellRootClass}>
  <body>
    <AppShell header={<><Logo /><NavTabs label="Main" items={nav} /></>} footer="…">
      <PageHeader title="Builds" subtitle="Every build" actions={<Button>New</Button>} />
      <Stack>
        <Section title="Recent">…</Section>
      </Stack>
    </AppShell>
  </body>
</html>;
```

- **`AppShell`** is the page frame: a sticky header that is always one `h-14` row (a nav that does
  not fit scrolls sideways, it never wraps), an optional `subnav` second row (same rule), `main`
  with fixed `py-8`, and an optional `footer`. `bleed` drops main's `Container` for a full-bleed
  page; the header keeps its own, so put a `Container` back around anything that should line up.
- **`Container`** is the only place the content width (`max-w-6xl`) and side padding
  (`px-4 sm:px-6`) are defined. **Pages never set their own width or outer padding**: no `max-w-*`,
  no `mx-auto`, no `px-*` on a page. AppShell already gives them the edge.
- **`PageHeader`** is the top of every page: optional `breadcrumbs`, the `title` (a `PageHeading`),
  `subtitle`, `actions` (right of the title from `sm`, under it on a phone) and `tabs` under it. Its
  fixed bottom margin puts every page's first block at the same y.
- **`Stack`** spaces blocks in a column: `gap="sm"` (`gap-4`) inside a group, `md` (`gap-6`, the
  default) between blocks, `lg` (`gap-8`) between groups. Use it instead of `space-y-*`.
  **`Section`** is a `<section>` Stack (`sm` by default) with an optional `SectionHeading` `title`
  and `actions` beside it.

### Page layouts

Small compositions of the above: they take slots, own no data, and set no page width or outer
padding. Each takes the `PageHeader` props (`title`, `subtitle`, `actions`, `breadcrumbs`, `tabs`)
except the last four.

- **`ListLayout`**: use this when a page is a filterable list. `filters` sits under the header;
  `children` is the list, replaced by `empty` when `isEmpty`.
- **`DetailLayout`**: use this when a page is one thing with facts beside it. `children` take two
  thirds from `lg` and `aside` one third; below `lg` the aside stacks under the main column.
- **`FormLayout`**: use this for a create or edit page. A `max-w-3xl` `<form>` that starts at the
  Container's left edge (it is not re-centred, so the title does not jump), with an `actions` row at
  the end. Other props (`onSubmit`, `action`) go on the `<form>`.
- **`CardGrid`**: use this for stat tiles or a gallery of cards. `columns` is `2`, `3` (default) or
  `4`: one column on a phone, two from `sm`, `columns` from `lg`.
- **`SidebarLayout`**: use this when a `rail` of navigation sits beside the content. Render it in
  `<AppShell bleed>`: it fills the height under the header with no header height written down
  (`AppShell`'s main is a flex column). The rail is `md:w-60` and stacks above the canvas below `md`;
  the canvas keeps the Container's padding.
- **`FullBleedLayout`**: use this for a viewer that needs the whole width. Render it in
  `<AppShell bleed>`; `children` fill the width, and an optional `panel` takes `lg:w-72` on the
  right and stacks below under `lg`.

  **`SidebarLayout` and `FullBleedLayout` deliberately break the shared left edge from `md` and
  `lg` up.** A full-height rail and an edge-to-edge viewer need the viewport's edges, so they cannot
  sit inside the Container the header uses. At 1280 px the header logo and every other layout start
  at x=88, `SidebarLayout`'s rail at x=0 and its canvas at x=264 (rail 240 + the Container's 24
  padding), `FullBleedLayout`'s `children` at x=0 (they add their own padding). Below `md` (`lg` for
  `FullBleedLayout`) everything stacks and all layouts agree at the Container's padding. To avoid
  the shift between pages, give a whole section of an app the same layout (every page under a
  project on `SidebarLayout`) rather than mixing it with `ListLayout` pages that a user moves
  between; the header, which stays inside the Container, is the constant. The title's y also
  differs from `ListLayout` only when one page passes `breadcrumbs` and the other does not:
  `PageHeader` puts them above the title in every layout.
- **`CenteredLayout`**: use this for sign-in, landing, not-found and error pages. A `max-w-md` card
  centred at a fixed offset from the top; the one layout that does not share the left edge.

```tsx
<AppShell header={header}>
  <ListLayout title="Quotes" actions={<Button>New</Button>} filters={<FilterGroup …/>}
    isEmpty={quotes.length === 0} empty={<Empty>No quotes yet.</Empty>}>
    {quotes.map(…)}
  </ListLayout>
</AppShell>
```

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
