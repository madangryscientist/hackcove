# @hackcove/ui

Hack Cove React components, written against Tailwind v4 utilities. They carry no theme: pair them
with a `@hackcove/theme-*` package such as `@hackcove/theme-catppuccin-mocha` and put its scope
class on `<html>` (`.dark` for Mocha). With no theme they render in Tailwind's own default colours,
a plain light look; it works, but it is not a look Hack Cove designs or checks.

Status: `0.x`, published to npm. License: MIT.

## Install

```sh
bun add @hackcove/ui
# peers: react >= 18, react-dom >= 18, tailwindcss ^4
# optional type peers: @types/react, @types/react-dom (install them in a TypeScript app)
```

One runtime dependency comes with it: `react-aria-components` (and `@internationalized/date`),
for `DateField`'s calendar. It brings no CSS; the classes are ours.

Tailwind skips `node_modules`, so tell it to scan the build for the utilities the components use,
in the stylesheet that imports Tailwind (the path is relative to that file):

```css
@import "tailwindcss";
@source "../node_modules/@hackcove/ui/dist";
```

## Use

```tsx
import { Card, PageHeading, Pill, Text } from "@hackcove/ui";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Text>Two things shipped.</Text> <Pill tone="emerald">ok</Pill>
  </Card>
);
```

## No styling props

No component takes `className` or `style`, as an own prop or through the HTML props it spreads
(`data-*`, `aria-*`, `id`, `title` and event props still pass). `Badge` pins to a corner with
`corner`, `ListRow` draws its line with `divided`; a look the component lacks is a prop or variant
to propose, not a class to add. A router link is drawn through `render` (see Router links), never
by copying a component's classes.

Every exported component passes `data-*` and `aria-*` through to its root element (an e2e hook such as
`data-testid`, or `aria-describedby`), so there is no need to wrap one in an element of your own to
carry them; `passthrough.test.tsx` fails for an export that does not. A component with no single
root (`DateField`) puts `data-*` on its wrapper and `aria-describedby` on the field.

## Sizes

One scale runs through the library: `Size` is `"sm" | "md" | "lg"`, and `md` is the default
wherever a component takes `size`. The controls (`Button` (also as a link), `IconButton`,
`ColourSchemeToggle`, `Input` (also `type="search"`), `Select`, `Textarea`, `Checkbox`, `RadioGroup`,
`DateField` (also with `calendar`), `SegmentedControl`, `Tabs variant="pill"`)
share heights at each step (`sm` 26px, `md` 38px, `lg` 46px, the same on a `Select` and a `DateField` as on an `Input`; a Playwright check measures them side by side in every theme), so a row of mixed controls at one size lines up. `Card`, `ListRow`,
`FileDrop`, `Dialog`, `Drawer`, `Avatar`, `SubsectionHeading`, `TextLink` and the bars take the
same three names. Only `Avatar` (`xl`, `2xl`) and the `Stack` gap (`xs`, `xl`) go beyond them.

One default is not `md`, on purpose: `Cluster`'s gap is `xs` (a row is a label and its chips,
which sit tight). `TextLink` with no `size`
takes the size of the text around it. Upgrading: `MIGRATING.md`, shipped in the package (`node_modules/@hackcove/ui/MIGRATING.md`).

## What is exported

- Primitives: `Card` (a bordered panel; `title` and `count` make a small heading, and `status` (a `Pill` or any node) sits right after them, where `actions` sits at the far end; `flush` drops the padding and clips the corners, for a table that runs edge to edge; `bar` moves the title, count and `actions` into a tinted strip over the body; `dashed` is an empty-state shell with centred muted text, and `dashed="filled"` the same on a surface fill with more padding; `badge` pins a `Pill` to the top-right corner over the content, on a panel or a link card, where it is part of the link's name; `attention` draws the strong warn edge (`border-amber-600`) round a card that needs a look, with or without `tone="warn"`, and does nothing on a `dashed` card; `footer` puts a tinted strip under a hairline across the bottom, for the card's own actions or a total: it takes the padding off the root and gives it to the body, so the strip runs edge to edge and stays at the foot of a card stretched in a `CardGrid`; not on a `dashed` card or a card that is a link; `as` is `section` (default), `article` or `div`; `id`, `data-*` and `aria-*` go on the root (on a link card too: the link inside takes only its own `aria-label`, `aria-labelledby` and `aria-current`); a titled panel is named by its title through `aria-labelledby`, unless you pass your own `aria-label` or `aria-labelledby`; a Card with an `id` is an anchor target, scrolled clear of the sticky header and outlined in violet while it is the `:target`),  `EpicHeader`, `Pill`, `groupByEpic`, `Markdown`, `Badge` (a small red count for sitting on an icon; `count` above 99 reads `99+`, `corner` pins it to the top-right of its `relative` parent; an `IconButton` takes `badge` and does this itself).
- Data: `StatTile` (one headline figure: an uppercase `label` over a large tabular `value`, already formatted, an optional `hint` under it; `tone` is `neutral` (default), `positive` or `negative`, and `accent` adds a bar across the top in the same tone), `ProgressBar` (a thin bar with a filled share of `max` (default 100); `label` names it for a screen reader, which also hears the percentage; `tone` is `accent` (default), `positive`, `warn` or `negative`), `SplitBar` (a bar split between `a` and `b` by their shares; `names` says whose is whose to a screen reader; `toneA` (default `negative`) and `toneB` (default `positive`)), `StackedBar` (any number of `segments`, each `{ label, value, tone }`, sized by its share of the sum; `legend` draws a `Legend` under it) and `Legend` (a swatch, a `label` and an optional `detail` per item, the key to a chart's or a row stripe's colours). The three bars take `size`: `sm` 6px, `md` 8px (default), `lg` 12px.
- Status pages: `NotFound` (404), `ErrorPage` (500 or any failure; `detail` is error text shown in a `CodeBlock`, never a stack trace, and `onRetry` adds "Try again"), `Offline` (`onRetry` too), `Maintenance` and `Forbidden` (403). Each is a whole page with default copy: `title` and `children` replace the heading and the body, `action` is the primary action, and `homeHref`, or `renderHome` for the app's own router `<Link>`, adds a "Back to home" button. With neither there is no home link.
- Layout (see Layout): `AppShell`, `AppShellBrand`, `appShellRootClassFor`, `Container`, `PageHeader`, `Stack`, `Section`, `Cluster`, `ClusterGrow`, and the page layouts `ListLayout`, `DetailLayout`, `FormLayout`, `ProseLayout`, `CardGrid`, `SidebarLayout`, `FullBleedLayout`, `CenteredLayout`.
- Typography roles (each pins size + weight, takes a `color` and an `as`): `Display`, `Lead`,
  `PageHeading`, `SectionHeading`, `SubsectionHeading`, `Overline`, `Text`, `Caption`. Opt-in props, none changing today's look: `SectionHeading rule`
  (a hairline under it, with its spacing), `SubsectionHeading size` (`sm`, `md` default, `lg`) and `truncate` (one line with an ellipsis),
  `Text strong` (font-medium in the primary ink, for emphasis), `Text preserveNewlines` (keeps a
  note's line breaks). The three inline roles (`Text`, `Caption`, `Overline`) also take `tone` (`muted`, `positive`, `warn`, `danger` or `info`: the same
  text colours as a `TableCell` tone, winning over `color`; pair the colour with a word, as in "Saved."),
  `numeric` (tabular figures), `mono` (the monospace face) and `truncate` (one line, cut with an
  ellipsis, the full text in a `title`, so its content is text).
- Controls: `Button` (`variant` is `primary` (default), `outline`, `ghost`, `link` or `dashed`, the link having no box: text with an underline on hover, for an in-line action, and the dashed one a dashed outline in muted text that fills its container, like `Card dashed`, for an "add another" row, with a leading icon as a child, ignoring `tone`; `size="sm"` is compact, `text-xs`, for table rows and toolbars, `size="lg"` is `text-base` with more padding; `tone="danger"` is red, for delete and clear, and `tone="positive"` green, for accept and approve; `disabledReason` disables it, greys it flat and makes the reason its `title`; `busy` disables it with `aria-busy` and keeps its colour, showing `busyLabel` in place of the children; `pressed` makes it a toggle with `aria-pressed`, on `outline` and `ghost` neutral when off and filled in the tone's primary colour when on, so an `outline` `size="sm"` Button with `pressed` is a filter chip; with `href`, or `render` to draw the app's own router `<Link>`, it is a link with the same look, `external` opening a new tab), `ButtonGroup` (a wrapping row of buttons; `end` is one item pushed to the far side, `label` makes it a named `role="group"`), `IconButton` (a square button holding one icon; `label` is required and becomes its `aria-label` and `title`; `variant` is `outline` (default) or `ghost`, `tone` is `default` or `danger`, `size` matches a `Button`'s height; `badge` puts a red count on its corner, not shown at 0; with `href` or `render` it is a link, `external` opening a new tab), `Icon` (one bare `<svg>` sized to fill a box: `size` `sm` 14px, `md` 16px (default) or `lg` 20px; `tone` is a text tone or `inherit` (default, the text colour around it); `aria-hidden` unless `label` names it as `role="img"`), `ColourSchemeToggle` (a light/dark switch on `<html>`; `id`, `data-*` and other button props go on the button, `store={false}` skips `localStorage`; see Light and dark), `Input` (a text input; `icon` adds a leading icon inside the field; `prefix` is short text inside the border before the value, a currency symbol, on a plain field only; `type="search"` drops the browser's search look and shows a "Clear search" button while the field has a value), `Textarea` (a multi-line text input, `rows` defaults to 3), `Select` (a native `<select>` in the control look; takes `<option>` children and keeps the browser's arrow). `Input`, `Select` and `Textarea` take `size` (`md` default, `sm`: `text-xs`, less padding, for dense forms and table rows, or `lg`: `text-base`, more padding) and `width` (`full` default, the fixed `xs` 5rem, `sm` 7rem, `md` 9rem, `lg` 12rem, `fill`: grows to the room left in a flex row and can shrink to nothing, so the buttons beside it stay on the line, or `auto`: no width class, as wide as the browser makes it); a fixed width replaces `w-full`, so there is no class to collide with. `Input` also takes `align` (`start` default, or `end` to right-align a numeric value). `size` replaces the native `size` attribute, so a multi-row `<select size={4}>` is not reachable through `Select`. `Checkbox` (a native checkbox with its label; other props go on the input; `size="sm"` is `text-xs` with a smaller box and `size="lg"` `text-base` with a larger one, `align="start"` puts the box on the first line of a label that wraps, where the default `center` centres it on all of them, and with no `label` it is a bare box for a table cell, named by `aria-label`; `description` is a muted line under the label, the box's `aria-describedby`). `RadioGroup` and `Radio` (one choice from a few options: the group has a `label`, `value`/`onChange` or `defaultValue`, `name`, `isDisabled`, `isRequired`, `size` (`sm`, `md` default, `lg`, as `Checkbox`) and an `error` shown like `Field`'s with `role="alert"`; each `Radio` has a `value`, a `label`, an optional `description` and `isDisabled`; one tab stop, the arrow keys move and choose). `Disclosure` (a summary button with a chevron and `aria-expanded` over a body that opens and closes; `summary`, `children`, `defaultOpen`; it keeps its own state and replaces `<details>`). `FileDrop` (a dashed drop zone, a `<label>` around a file input that covers it, so a click opens the dialog and a dropped file lands on the input; `children` is the prompt, `accept`, `multiple`, `name`, `disabled` and `onChange` on the input). `CopyButton` (a small text button that writes `text` to the clipboard and swaps `label` ("copy") for `copiedLabel` ("copied"); every other button prop, `disabled` included, goes on the `<button>`). `CopyLine` (one line of mono text in a box with a `CopyButton` beside it; `disabled` disables the button; other props go on the root `<div>`). `Field` (a label above a control, `htmlFor` names the control's id; a `hint` sits under it, and an `error` replaces the hint with a `role="alert"` line; `span="full"` runs it across both columns of a `FormGrid`). `FormGrid` (two columns of `Field`s from `md`, one below it), `FormRow` (an inline-edit row: `FormRowField`s side by side, an `action` after them, and one `hint` or `error` under the whole row; see Layout) and `FormRowField` (a compact label over one control, `span` 1 to 4). `Callout` (a tinted notice box; `tone` is `neutral`, `info` (default), `positive`, `warn` or `danger`; an optional `title` sits in bold above the body; `actions` puts a button or link at the end of the row; `banner` makes it a flat strip, bottom border only and no radius, for the top of a `Card flush`). `ListRow` (a full-width row that is a `<button>`, or a link with `href` or `render`, with a hover fill, a left-aligned label and `trailing` content; `divided` draws a hairline above the row, to separate rows in a `Card flush`; `expanded` makes it the header of a collapsible section: `aria-expanded` and a chevron, the caller owning the state and the section; `leading` is content before the label (an `Avatar`), and `leadingWidth="thumbnail"` gives it a fixed width so rows with and without a picture line up; `size` sets the padding (`sm` dense, `md` default, `lg`); `focused` draws the focus ring on the row the keyboard cursor is on, for a list moved with the arrow keys while focus stays on the list; `selected` marks the row in view with a violet fill and `aria-current="true"`; a link row (`href` or `render`) can hold its own link, button or control in `trailing`, which sits above the row's link and takes its own click; `static` makes it a plain `<div>`, for a row that holds its own buttons where the row would otherwise be a `<button>`, and adds `actions`, buttons after `trailing`, and `revealOnHover`, which shows them only on hover or focus inside the row and always on a touch screen; `active` marks the row the pointer or the keyboard is on, with the hover fill and the `revealOnHover` actions shown, for a list that follows both through the row's `onPointerEnter`, `onPointerLeave` and `onFocus`, which every row passes through). `Tabs` (underline tabs for switching a view in place: a row over a bottom rule, the current tab underlined in the accent; `items` are `{ value, label }` buttons, with `value` the current one's `value` and `onChange(value)` the caller's state, one tab stop and the arrow keys, Home and End moving between enabled tabs, or `{ label, href | render, active?, external? }` links in a `<nav>` with `aria-current="page"` on the current one (`active`, or the item whose `value` is `value`); `label` names the group; a button tab takes `disabled` and `controls`, the id of its `role="tabpanel"`, which is the caller's; `variant="pill"` fills the current tab, with no rule, for `PageHeader`'s `tabs` slot, an `AppShell` `nav` or a rail; only a pill row takes `size` and `orientation`, and `orientation="vertical"` stacks it in one column, the content of a `SidebarLayout` rail; `disabled` on the row disables every tab, e.g. until hydration). `SegmentedControl` (a joined pill group, one option filled; the same `items`, `value`, `onChange`, `disabled` and `label` as `Tabs`, as a `radiogroup` with `aria-checked` on each `radio`). On both an item takes `data-*` attributes (typed `data-${string}`) onto its button or link; on `Tabs` and `SegmentedControl` an item takes `count` (a small muted number after the label, part of its name: "Shots 12") and `title`; a `disabled` button option stays in the page as `aria-disabled`, so its `title` is still the hover tooltip and is announced as the reason, it is out of the tab order and the arrow keys, Home and End skip it. `Dialog` (a modal on the browser's `<dialog>`, opened on mount, so render it only while open: `title` is its name, `description` a line under it, `footer` the right-aligned actions; Esc, the backdrop or a `<form method="dialog">` call `onClose`; `size` is `sm` (320px, a list), `md` (440px, default, a form) or `lg` (640px, a wider form or a table)). `FieldDialog` (a `Dialog` with one text field and Cancel and submit buttons, every string passed in: `title`, `description`, `label`, `inputLabel`, `placeholder`, `hint`, `emptyReason`, `submit` and `busyLabel`; `onSubmit` gets the trimmed value and a resolved promise closes it, a rejection shows its message). `Drawer` (a modal slide-over on the right edge, on a native `<dialog>` opened on mount like `Dialog`, so render it only while open: `title` is its name, a close button sits beside it, `children` scroll between the header and an optional pinned `footer`; Esc, the scrim and the close button call `onClose`; `size` is `sm`, `md` (default) or `lg`; `closeLabel` names the close button). `Breadcrumbs` (a `<nav aria-label="Breadcrumb">` over an ordered list; `crumbs` are nodes, or `{ label, href | render, external? }` for one that links; the last is the current page and is never a link and gets `aria-current="page"`, and each crumb truncates). `Table` (a list of records in a rounded, bordered card around a full-width `<table>` that scrolls sideways on a narrow screen; `caption` names it for assistive tech and is not drawn; compose it from `TableHead`, `TableBody`, `TableFoot`, `TableRow`, `TableHeaderCell` (`align` `start` or `end`; `srLabel` is a visually hidden column name, in place of children, for a column of row actions: "Actions") and `TableCell` (`align`, `tone` `default`, `strong` or `muted`, or the Callout tones `neutral`, `info`, `positive`, `warn` or `danger` for an amount that means something, in the tone's text colour and with no fill, so pair the colour with a sign or a word; `numeric` for tabular figures, `mono` for a small mono face, `truncate` to cap a long value's width, cut it with an ellipsis and put the full text in a `title`, so its content is text (strings and numbers); `secondary` for a second, muted line under the content; `colSpan` passes through, so a `TableCell` with `colSpan` in a row of its own is a full-width panel, an empty state or a note); `TableFoot` (the `<tfoot>` for totals and subtotals: its cells are strong by default and each row has a firmer line above it, in a card and in a `plain` table alike); `TableGroupRow` (a full-width group header in the body: `label` spans `colSpan` columns, the table's column count, which is required; optional `trailing` content sits at the far end, and the group's rows follow it); `tone` on a `TableRow` in the body marks the row with a stripe on its leading edge over a soft fill: `neutral`, `info`, `positive`, `warn` or `danger`, as `Callout`, or `muted`, which only fades the row (a transfer, a row that is not the point); a bold subtotal is not a tone; `stripe` (a text tone) draws the leading stripe alone, with no fill, and is never combined with `tone`; `variant="plain"` on `Table` drops the card border, fill and shadow, the head strip and the row hover and keeps the row dividers, for a table inside a card of its own; every table element passes `id`, `data-*` and `aria-*` through, and none takes a `className` or `style`). `Timeline` (a named `<ol>` of events; `label` is its `aria-label`, `empty` is drawn instead when there are no items) with `TimelineItem` (a `title`, an already-formatted `time`, the `children` as a note, and `tone`, a Callout tone for the marker dot, `neutral` by default). `KeyValueList` (a `<dl>` of label/value rows; each `KeyValue` takes a `label` and its value as children, the value right-aligned in tabular figures; `align="start"` puts the values left-aligned in one column beside the labels instead, using CSS subgrid: in Chrome before 117 a row stacks its label over its value). `Avatar` (a round badge of the initials of `name`, titled with the name and `aria-hidden`; with `src` (the app's own local image path, never a remote one) it is a round, cropped `<img alt={name}>` instead; `size` is `sm`, `md` (default), `lg`, `xl` (56px) or `2xl` (96px); `ring` adds a page-colour border and a negative margin for an overlapping stack; the colour is one of seven stock background classes picked by a hash of the name, remapped by each theme, and `avatarColourClass(name)` returns it to colour something else the same way; `initialsOf(name)` is the two letters). `TextLink` (an inline text link in the accent colour; `href` is required unless `render` draws the app's own router `<Link>`, `external` adds `target="_blank"` and `rel="noreferrer"`, `stretch` covers the nearest `relative` ancestor so a whole row or card is the click target, `size` (`sm`, `md` or `lg`) pins the type size where it would otherwise follow the text around it, `mono` sets the monospace face, `tone` (`warn`, `danger`, `positive`, `info` or `muted`) gives it a meaning's colour in place of the accent, every other anchor prop passes through). `MetaList` (a wrapping row of facts or links in muted small text, joined by an `aria-hidden` `separator`: `·` (default), `•` or `none`; branch · SHA · date, or a footer's Privacy · Terms; an item is text, a `Code` or a `TextLink`; `nowrap` keeps each item on one line, for links; `mono` sets the row in the monospace face, for ids and paths). `PageFade` (the page's content area, named for the View Transitions API so a route change cross-fades it while the frame around it stays put; wrap what changes between pages, once per page, or give each a `name` (a CSS identifier) when there are two; it fades when the navigation runs in a view transition, through `startPageTransition(update)` (flushes a synchronous state change inside `document.startViewTransition`) or a router's own option such as TanStack Router `viewTransition`, and otherwise, in a browser without View Transitions, or under `prefers-reduced-motion: reduce`, it swaps with no fade; it renders a small `<style>`, with no colour in it, and the div is a stacking context, so portal an overlay that must rise above the frame). `EmptyState` (what a page or list shows when it has nothing yet: a centred `title`, the `children` as the explanation under it, and `actions` in a centred row; a named `<section>`; `level` is the title's heading level, 2 (default) to 6, and does not change its look; for one muted line inside a card, `Text as="p" color="muted"`). `Steps` (a numbered `<ol>` of `Step`s, each a `title` and the `children` as a detail line, the numbers counted by CSS in a violet disc; for a "get started" list, not for progress). `Divider` (a hairline `<hr>` in the theme's line colour; spacing comes from the layout around it). `BulletList` (a `<ul>` with discs, an indent and a small gap; children are `<li>`s). `Code` (inline code: mono, on a subtle background). `CodeBlock` (a static multi-line block of code, no client JS: the text is `children` (a string) or `lines` (one entry per line), `language` (`bash`, `css`, `tsx`, `ts` or `json`) colours it and `text`, the default, leaves it in one colour; `label` is a caption naming the language or file, long lines wrap; other props go on the root `<figure>`). `CodeExample` (one framed example: the rendered `children` over the `code` that makes them, coloured as TSX, in one bordered box, with an optional `caption` as its last band; no client JS). `Video` (a full-width, rounded `<video>` with controls that loads metadata only; `src` is required, `poster` and a WebVTT `captions` track are optional, children are the fallback). `Kbd` (a keyboard key in mono; its border takes the surrounding text colour, so it reads on a filled button too). `FilterGroup` (a `<fieldset>` with a small uppercase `legend` over a wrapped row of its children, e.g. `outline` `sm` `Button`s with `pressed`). `DateField` (see Dates).
- Dates: `toISODate`, `fromISODate`, and the `CalendarDate` type.

## Dates

```tsx
import { DateField, fromISODate, toISODate, type CalendarDate } from "@hackcove/ui";

<DateField
  calendar
  label="Date of birth"
  description="DD/MM/YYYY"
  defaultValue={fromISODate("1990-05-17")}
  maxValue={fromISODate("2026-10-23")}
  onChange={(date: CalendarDate | null) => save(toISODate(date))}
  name="dob"
  isRequired
/>;
```

- `DateField` is a segmented DD/MM/YYYY field (always en-GB, whatever the browser's locale).
  `calendar` adds a calendar button. The popover has ‹ › month steps, month and year dropdowns,
  Monday-first weeks and a Clear action. `defaultOpen` opens it on mount.
- Without `calendar` it is typed only, for a date the person knows by heart.
- It takes `label`, `description`, `errorMessage`, `value` / `defaultValue` / `onChange`,
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
- `error` is an error from outside the field, a server's say: it shows in place of the description,
  in red with `role="alert"` (as `Field`'s `error` does), and marks the field invalid. It wins over
  the built-in messages; clear it when the date changes. `isInvalid` marks the field invalid with no
  message of its own; pair it with `errorMessage`.

## Router links

`@hackcove/ui` has no router dependency. `Tabs` and `SegmentedControl` (an item with `href` or `render`), `Breadcrumbs` (a crumb), `TextLink`,
`ListRow`, `Pill`, `IconButton` and `Button` take a `render` function that draws the app's own `<Link>`, handed the component's
classes (and `aria-current` on the active tab) to spread on it. The call site carries no `className`:

```tsx
<Tabs
  variant="pill"
  label="Main"
  items={[
    { label: "Quotes", active: true, render: (props) => <Link to="/quotes" {...props} /> },
    { label: "Traces", href: "https://traces.example.com", external: true },
  ]}
/>
<Button variant="ghost" render={(props) => <Link to="/quotes" {...props} />}>Back</Button>
```

With `render`, `href` is not used. The props `render` is handed are the exported type `LinkRenderProps`:
`className` and `children`, plus `aria-current`, `target`, `rel` and `title` when there is one. Each
optional field is `?: T` and an absent one is left out, never set to `undefined`, so the spread
compiles on a router `<Link>` that declares its props the same way under `exactOptionalPropertyTypes`
(TanStack Router's does). Any other anchor prop you gave the component (`id`, `download`, a handler)
is handed over too. The class strings are not exported: `render` is the one way to draw a router
link.

## Layout

One content edge for every page, so nothing moves sideways between pages or viewport sizes.

```tsx
import { AppShell, PageHeader, Section, Stack, Tabs, appShellRootClassFor } from "@hackcove/ui";

// Your root layout. `appShellRootClassFor` adds `overflow-y-scroll`: it reserves the scrollbar, so
// a short page and a long one centre their content at the same x. AppShell cannot set it itself.
<html className={appShellRootClassFor("light")}>
  <body>
    <AppShell brand={<Logo />} nav={<Tabs variant="pill" label="Main" items={nav} />} footer="…">
      <PageHeader title="Builds" subtitle="Every build" actions={<Button>New</Button>} />
      <Stack>
        <Section title="Recent">…</Section>
      </Stack>
    </AppShell>
  </body>
</html>;
```

- **`AppShell`** is the page frame: a sticky header that is always one `h-14` row (a nav that does
  not fit scrolls sideways, it never wraps, and the edge with more to scroll to fades out until it
  is reached), an optional `subnav` second row (same rule), `main`
  with fixed `py-8`, and an optional `footer`. The header row is filled by slots, left to right:
  `brand` (logo and name, at the brand type with the logo gap), `nav` (pill `Tabs` of links), `header` (a
  free node, the escape hatch) and `controls` (end-aligned, `gap-2`, centred): no wrapper and
  no styling. Nothing in `controls` shrinks, and a full-width control there (a `Select` at its
  default `width="full"`) sizes to its content, so a `Select` next to a `ColourSchemeToggle` leaves
  the toggle its square. `hideChromeInPrint` is opt-in: the header and footer are hidden in print and main
  drops its padding (the page margin is then your `@page`); without it a print is unchanged. `bleed` drops main's `Container` for a full-bleed
  page; the header keeps its own, so put a `Container` back around anything that should line up.
- **`AppShellBrand`** is the `brand` slot as one link: `logo` and `label` inside the same `<a>`, so
  the whole brand goes home (the label names the link; the logo is hidden from assistive tech).
  `logoSize` is `sm` (20px), `md` (24px, the default, an `Avatar size="sm"`) or `lg` (32px); an
  `<img>` or `<svg>` logo fills it. With `render` it draws your router's `<Link>`, as `Tabs`,
  `Breadcrumbs` and `TextLink` do:

  ```tsx
  <AppShell brand={<AppShellBrand logo={<Avatar name="Quotes" size="sm" />} label="Quotes"
    render={(props) => <Link to="/" {...props} />} />} …>
  ```

  A plain node in `brand` still works. Stories: `Layout/AppShell › LinkedBrand`, `RouterBrand`.
- **`appShellRootClassFor(scheme, schemes?)`** is what goes on `<html>` when the server knows the
  scheme: that scheme's class and `overflow-y-scroll`, joined, so there is no string concatenation:
  `<html className={appShellRootClassFor(scheme, schemes)}>`. With no scheme, pass `"light"`.
  `schemeClass` stays exported.
- **`Container`** is the only place the content width (`max-w-6xl`) and side padding
  (`px-4 sm:px-6`) are defined. **Pages never set their own width or outer padding**: no `max-w-*`,
  no `mx-auto`, no `px-*` on a page. AppShell already gives them the edge.
- **`PageHeader`** is the top of every page: optional `breadcrumbs`, the `title` (a `PageHeading`),
  `subtitle`, `actions` (right of the title from `sm`, under it on a phone) and `tabs` under it. Its
  fixed bottom margin puts every page's first block at the same y.
- **`Stack`** spaces blocks in a column: `gap="xs"` (`gap-2`) between lines of one text block (a
  heading, the line under it), `sm` (`gap-4`) inside a group, `md` (`gap-6`, the default) between
  blocks, `lg` (`gap-8`) between groups, `xl` (`gap-12`, `sm:gap-16`) between a page's top-level blocks. Use it instead of `space-y-*`. `width` caps the column:
  `narrow` (`max-w-3xl`, a reading measure), `wide` (`max-w-5xl`), `full` (`w-full`) or `default`
  (nothing). A capped Stack starts at the Container's left edge and is never re-centred.
  `as` is `div` (default), `section`, `form`, `ul` or `ol`, and nothing else. A `form` Stack takes
  the form props (`onSubmit`, `action`, `method`, `noValidate`, `aria-*`, `data-*`). A `ul` or `ol`
  Stack has no markers and its children are `<li>`s (the Stack does not wrap them, as with
  `BulletList` and `Timeline`; `Text as="li"` works).
  **`Section`** is a `<section>` Stack (`md` by default, like `Stack`) with an optional `SectionHeading` `title`,
  `actions` beside it and the same `width`.
- **`Cluster`** spaces items in a row, the counterpart of `Stack`: `gap` is `xs` (`gap-2`, the default), `sm`
  (`gap-4`) or `md` (`gap-6`), `align` the cross axis (`center` (default), `baseline`,
  `start` or `end`), `justify` the main axis (`start` (default), `between` or `end`), and `wrap`
  lets the row flow onto more lines on a narrow screen (off by default). Wrap the one item that
  should take the room left in **`ClusterGrow`**, an input beside its buttons say: it can shrink to
  nothing, so the items beside it stay on the line. An empty `ClusterGrow` is a spacer that pushes
  what follows it to the end. `ButtonGroup` stays the row for buttons; `Cluster` is any other row.
  It is a separate part, not `Stack direction="row"`, because a row has no `lg`, `xl` or
  `width` and a column has no `align` or `justify`.
- **`FormGrid`** is the two-column form: `Field`s in two columns from `md`, one below. A `Field`
  with `span="full"` (a textarea, a long hint) runs across both. **`FormRow`** is an inline-edit
  row of **`FormRowField`**s (a compact `text-xs` label over a control; `span` 1, 2, 3 or 4 is its
  share of the row, so 2, 1 and 1 give a half and two quarters) with an optional `action` after
  them (a save button, kept at its own width). Every control sits on the bottom edge, so the action
  lines up with them, and under `md` the fields and the action stack. A `FormRow` is always the full
  width of a `FormGrid`. Its `hint` or `error` (which replaces the hint, `role="alert"`) sits under
  the whole row; a `FormRowField` has no note of its own, so the controls beside each other stay
  level. Closed spans, no `col-span` or width to pass.

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
- **`ProseLayout`**: use this for a text page (privacy, terms, a CV, an about page). One `narrow`
  (`max-w-3xl`) column that starts at the Container's left edge (not re-centred, so the title does
  not jump): the header, then `children` in a `Stack` (`gap` prop, `md` by default). Unlike
  `FormLayout` the header sits inside the column, so its `actions` stay beside the text.
- **`CardGrid`**: use this for stat tiles or a gallery of cards. `columns` is `2`, `3` (default) or
  `4`: one column on a phone, two from `sm`, `columns` from `lg`. `columns="auto"` instead fits as
  many per row as the width allows, each at least `minWidth` wide: `md` (17rem, default) or `sm`
  (12rem); `minWidth` is only for `auto`. `align="start"` keeps each card its own height; the
  default stretches every card to the tallest in its row. `as="ul"` makes it a list, each child
  wrapped in an `<li>`.
- **`SidebarLayout`**: use this when a `rail` of navigation sits beside the content. Render it in a
  plain `<AppShell>`, no `bleed`: it sits in the Container like every other layout, so the rail
  starts at the header logo's x and the canvas ends at the header's right edge. The rail has no fill
  and no border (pill `Tabs` with `orientation="vertical"` is its content); from `md` it is `md:w-56` beside
  the canvas, and below `md` it stacks above it. A long rail sets `railLabel`: below `md` the rail
  then folds, closed, behind a disclosure of that name, so a phone shows the page first.
- **`FullBleedLayout`**: use this for a viewer that needs the whole width. Render it in
  `<AppShell bleed>`; `children` fill the width, and an optional `panel` takes `lg:w-72` on the
  right and stacks below under `lg`. It adds no padding, so a viewer fills the width; set `padded`
  for a body that is not a viewer, which gives the canvas the other layouts' page padding. A `bar`
  (a viewer's title and actions) runs full width above both on the surface with a bottom line, and
  sticks under the shell's header as the page scrolls; `padded` does not pad it.

  **`FullBleedLayout` deliberately breaks the shared left edge from `lg` up.** An edge-to-edge
  viewer needs the viewport's edges, so it cannot sit inside the Container the header uses. At
  1280 px the header logo and every other layout start at x=88, `FullBleedLayout`'s `children` at
  x=0 (unless `padded`). Below `lg` it stacks and agrees with the other layouts. To avoid the shift
  between pages, give a whole section of an app the same layout rather than mixing it with
  `ListLayout` pages that a user moves between; the header, which stays inside the Container, is
  the constant. The title's y also
  differs from `ListLayout` only when one page passes `breadcrumbs` and the other does not:
  `PageHeader` puts them above the title in every layout.
- **`CenteredLayout`**: use this for sign-in, landing, not-found and error pages. A `max-w-md` card
  centred at a fixed offset from the top; the one layout that does not share the left edge.

```tsx
<AppShell header={header}>
  <ListLayout title="Quotes" actions={<Button>New</Button>} filters={<FilterGroup …/>}
    isEmpty={quotes.length === 0} empty={<Text as="p" color="muted">No quotes yet.</Text>}>
    {quotes.map(…)}
  </ListLayout>
</AppShell>
```

## Light and dark

A dark theme does its colour work under `.dark`; this only decides whether `.dark` is on `<html>`.
Two states, light and dark. The stored choice wins; with nothing stored the system's
`prefers-color-scheme` decides. Which dark theme is loaded stays your CSS import.

1. **Inline `colourSchemeScript` in `<head>`**, before the stylesheet, so the class is right at
   first paint and neither scheme flashes the other. It is a few hundred bytes of plain JavaScript:

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

   <ColourSchemeToggle onChange={(scheme) => track(scheme)} />;
   ```

   It is an `IconButton` showing the scheme you would switch *to* (a sun on a dark page, a moon on a
   light one), labelled "Switch to light theme" / "Switch to dark theme". A click applies the scheme
   to `<html>` and stores it under `localStorage["hackcove:colour-scheme"]`; a storage error (private
   mode) is swallowed and the page still switches. It reads the current state from the `dark` class
   when it mounts, so it agrees with the script and renders the same on the server and the client.
   It draws both icons and a small `<style>` shows one from the class on `<html>`, so a dark visitor
   with no cookie and no `initial` sees the sun from the first frame, not the server's light-page moon;
   the button's name catches up on hydration.

4. **A light theme with a class of its own, or a scheme the server knows.** An app that picks the
   scheme from a cookie and whose light theme has a scope class passes both:

   ```tsx
   import { ColourSchemeToggle, schemeClass } from "@hackcove/ui";

   const schemes = { light: "my-light", dark: "dark" }; // default: { light: "", dark: "dark" }

   <html className={schemeClass(scheme, schemes)}>
   <ColourSchemeToggle schemes={schemes} initial={scheme} onChange={(next) => saveCookie(next)} />
   ```

   Leave `colourSchemeScript` out here: it knows only the `dark` class and the stored choice, so it would fight the server. `schemes` is the class each scheme puts on `<html>`; a click swaps them. `initial` is the scheme the
   server rendered: the server markup, the hydrating client and the `<html>` class (from
   `schemeClass`) then agree, with no flash. Persist the choice from `onChange`; the toggle still
   writes `localStorage`, which an app reading a cookie simply ignores. With neither prop nothing
   changes: `dark` on and off, light on the server.

   **Persisting to a cookie instead of `localStorage`.** Pass `store={false}` (default `true`) and write the
   choice from `onChange`; the toggle then touches no storage at all:

   ```tsx
   <ColourSchemeToggle
     store={false}
     initial={scheme} // read from the cookie on the server
     onChange={(next) => {
       document.cookie = `scheme=${next}; path=/; max-age=31536000; samesite=lax`;
       // or POST it to the server, which sets the cookie
     }}
   />
   ```

   The toggle takes `id`, `data-*` and the rest of a button's props, which go on its button. It has no
   `aria-pressed`: its label already says what a click does ("Switch to dark theme"), and a pressed state on a
   button whose label changes would say it twice.

Without React, `applyColourScheme(scheme, root?, schemes?)`, `readColourScheme(fallback?)`,
`storeColourScheme(scheme)` and `schemeClass(scheme, schemes?)` are exported too; `ColourScheme` is
`"light" | "dark"` and `ColourSchemeClasses` is the `schemes` shape.

## Palette

`palette.json` (in the repo, not in the package) lists the colour utilities the components may use,
by role.

| Role       | For                                                                   |
| ---------- | --------------------------------------------------------------------- |
| `canvas`   | The page behind the cards: `AppShell` paints it.                      |
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
`bunx nx pack-check ui` (the tarball is `dist/` plus `package.json`, `README.md`, `LICENSE`; it also typechecks the tarball in a
consumer app: `scripts/consumer-types.ts`).
The stories live in `apps/storybook`.
