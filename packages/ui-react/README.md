# @slashsuite/ui-react

UISlash React components, written against Tailwind v4 utilities. They carry no theme: pair them
with a theme from `@slashsuite/themes`, such as `@slashsuite/themes/catppuccin-mocha.css`, and put its scope
class on `<html>` (`.dark` for Mocha). With no theme they render in Tailwind's own default colours,
a plain light look; it works, but it is not a look UISlash designs or checks.

Status: `0.x`, published to npm. License: MIT.

## Install

```sh
bun add @slashsuite/ui-react
# peers: react >= 19, react-dom >= 19, tailwindcss ^4
# optional type peers: @types/react, @types/react-dom (install them in a TypeScript app)
```

One runtime dependency comes with it: `react-aria-components` (and `@internationalized/date`),
for the date controls (`DateField`, `DateRangePicker`), `Menu`, `Disclosure`, `RadioGroup` and
`SortableList`'s keyboard and drag. It brings no CSS; the classes are ours.

Tailwind skips `node_modules`, so tell it to scan the build for the utilities the components use,
in the stylesheet that imports Tailwind (the path is relative to that file):

```css
@import "tailwindcss";
@source "../node_modules/@slashsuite/ui-react/dist";
```

## Use

```tsx
import { Card, PageHeading, Pill, Text } from "@slashsuite/ui-react";

export const Example = () => (
  <Card title="Status" count={2}>
    <PageHeading>All good</PageHeading>
    <Text>Two things shipped.</Text> <Pill tone="positive">ok</Pill>
  </Card>
);
```

## No styling props

No component takes `className` or `style`, as an own prop or through the HTML props it spreads
(`data-*`, `aria-*`, `id`, `title` and event props still pass). `Badge` pins to a corner with
`corner`, `ListRow` draws its line with `divided`; a look the component lacks is a prop or variant
to propose, not a class to add. A router link is drawn by the app's `LinkProvider` (see Router links), never
by copying a component's classes.

Every exported component passes `data-*` and `aria-*` through to its root element (an e2e hook such as
`data-testid`, or `aria-describedby`), so there is no need to wrap one in an element of your own to
carry them; `passthrough.test.tsx` fails for an export that does not. A component with no single
root (`DateField`) puts `data-*` on its wrapper and `aria-describedby` on the field.

## Sizes

One scale runs through the library: `Size` is `"sm" | "md" | "lg"`, and `md` is the default
wherever a component takes `size`. The controls (`Button` (also as a link), `IconButton`,
`ColourSchemeToggle`, `Input` (also `type="search"`), `Select`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`,
`DateField` (also with `calendar`), `SegmentedControl`, `Tabs orientation="vertical"`)
share heights at each step (`sm` 26px, `md` 38px, `lg` 46px, the same on a `Select` and a `DateField` as on an `Input`; a Playwright check measures them side by side in every theme), so a row of mixed controls at one size lines up. The text of a `Button`, `Input`, `Select`, `Textarea`, `DateField`, `DateRangePicker`, `SegmentedControl` and vertical `Tabs` is `text-sm`, `text-base` and `text-lg` at `sm`, `md` and `lg`, one step down under `AppShell density="compact"`, and a field is never under 16px on a touch screen; a `Checkbox`, `Switch` or `RadioGroup` label is one step smaller. `Button`, `IconButton`, `SegmentedControl` and `Icon` also take a `ResponsiveSize`, `{ base, md }`, which changes at the `md` breakpoint in CSS. `Card`, `ListRow`,
`FileDrop`, `Dialog`, `Drawer`, `Avatar`, `SubsectionHeading`, `TextLink` and the bars take the
same three names. Where a scale goes past them, and the few defaults that are not `md`, are
listed once, on the `Size` type. `TextLink` with no `size` takes the size of the text around it. Upgrading: `MIGRATING.md`, shipped in the package (`node_modules/@slashsuite/ui-react/MIGRATING.md`).

## Disabled

A control that cannot be used says why. `Button`, `IconButton`, `Checkbox`, `Switch` and a button
`ListRow` take `disabledReason`: the control fades, stays focusable and `aria-disabled`, and the
reason is its tooltip and its description. A `Tabs` or `SegmentedControl` option takes the same
`disabledReason` on its item. Every other control (`Input`, `Textarea`, `Select`, `FileDrop`,
`DateField`, `RadioGroup`, `CopyLine`, `ChatComposer`, a `Fieldset`) takes the native `disabled`,
with the reason in the text beside it: its `Field` hint, or its own `hint`. A link is never
disabled: leave it out, or say in the text why it is not there.

## What is exported

- Primitives: `Card` (a bordered panel; `title` and `count` make a small heading, `titleStyle="name"` sets the title in sentence case in the primary ink for a card that is a named thing (the default `overline` is small uppercase), and `status` (a `Pill` or any node) sits right after them, where `actions` sits at the far end; `flush` drops the padding and clips the corners, for a table that runs edge to edge; `bar` moves the title, count and `actions` into a tinted strip over the body; an empty state is an `EmptyState`, not a card form; `badge` pins a `Pill` to the top corner at the end edge over the content, on a panel or a link card, where it is part of the link's name; `icon` puts one of the `Icon` set's names above the title at `feature` size in the accent colour, decorative, on a panel or a link card but not a `bar` or `flush` one; `attention` draws the strong warn edge (`border-amber-600`) round a card that needs a look, with or without `tone="warn"`; `footer` puts a tinted strip under a hairline across the bottom, for the card's own actions or a total: it takes the padding off the root and gives it to the body, so the strip runs edge to edge and stays at the foot of a card stretched in a `CardGrid`; not on a card that is a link; `fill` takes the parent's full height: the title or bar stays put and the body scrolls; the parent sets the height; not on a card that is a link; `inset` is a full-bleed band (a progress bar, a chart, an image) under the title and over the children, running edge to edge of a padded card; a bordered sub-card inside a card is a nested `Card tone="neutral"`; a card with a `title` or an `aria-label` is a `section` and any other a `div`, and `as="article"` makes it an `article`; the title is an `h2` on the page and an `h3` in a `Section`, and `level` sets it by hand; `size="sm"` makes a `Button`, `IconButton` or `Pill` inside with no `size` `sm` too, and a `Stack` in any card is `xs` apart; `id`, `data-*` and `aria-*` go on the root (on a link card too: the link inside takes only its own `aria-label`, `aria-labelledby` and `aria-current`); a titled panel is named by its title through `aria-labelledby`, unless you pass your own `aria-label` or `aria-labelledby`; a Card with an `id` is an anchor target, scrolled clear of the sticky header and outlined in the accent colour while it is the `:target`),  `Pill` (a small tinted label; `tone` is what it means, `neutral` (default), `info`, `positive`, `warn` or `danger`, or `accent` for a category that is none of those; `size` is `sm`, `md` (default) or `lg`, and left out it takes its container's; `dot`, `round` and `title` (its tooltip on hover, keyboard focus and a tap, and its description; a plain pill with one takes a tab stop); `name` makes it a two-tone `name: value` pill, the name keeping the tint and the children, the value, on the surface; `href` makes it a link and `onClick` a button; `onRemove` with `removeLabel` adds an x button, a separate button beside a link or button pill and never inside it), `Markdown`, `Badge` (a small red count for sitting on an icon; `count` above 99 reads `99+`, `corner` pins it to the top corner at the end edge of its `relative` parent; an `IconButton` takes `count` and does this itself).
- Data: `StatTile` (one headline figure: an uppercase `label` over a large tabular `value`, already formatted, an optional `hint` under it; `tone` is `neutral` (default), `positive`, `warn` or `danger`, and `accent` adds a bar across the top in the same tone; `trend` (numbers, oldest first) draws a small line under the value in its colour on a scale from 0; it is decoration, so say the trend in `hint` too), `ProgressBar` (a thin bar with a filled share of `max` (default 100); `label` names it for a screen reader, which also hears the percentage; `tone` is `accent` (default), `positive`, `warn` or `danger`), `SplitBar` (a bar split between `a` and `b` by their shares; `names` says whose is whose to a screen reader; `toneA` (default `danger`) and `toneB` (default `positive`)), `StackedBar` (any number of `items`, each `{ label, value, tone }`, sized by its share of the sum; `legend` draws a `Legend` under it), `TrendChart` (one or two series over ordered buckets, on a y axis from 0: `label` is its name and its table's caption, `buckets` the x labels in order, `series` one or two `{ label, tone, values }`, where a `null` or missing value draws nothing and breaks a line; `kind` is `bar` (default, a count per bucket) or `line` (a level over time); a hidden table holds the same figures for a screen reader, and two series draw a `Legend` under the chart) and `Legend` (a swatch, a `label` and an optional `detail` per item, the key to a chart's or a row stripe's colours). The three bars take `size`: `sm` 6px, `md` 8px (default), `lg` 12px.
- Status pages: `NotFound` (404), `ErrorPage` (500 or any failure; `detail` is error text shown in a `CodeBlock`, never a stack trace, and `onRetry` adds "Try again"), `Offline` (`onRetry` too), `Maintenance` and `Forbidden` (403). Each is a whole page with default copy: `title` and `children` replace the heading and the body, `actions` are the page's own buttons, before the home link. Every page but `Maintenance` links "Back to home", to `LinkProvider`'s `home` (`/` by default): say where home is once, on the provider, never on a page. `Maintenance` has none, since home is the site that is down.
- Layout (see Layout): `AppShell`, `AppShellBrand`, `appShellRootClassFor`, `Container`, `PageHeader`, `Hero`, `Stack`, `Section`, `Cluster`, `ClusterGrow`, `SideColumn`, `CardGrid`, and the page layouts `ListLayout`, `DetailLayout`, `FormLayout`, `ProseLayout`, `SidebarLayout`, `FullBleedLayout`, `CenteredLayout`.
- `Prose` (a `div` for long-form content, a docs page or an article, never an app screen: it sets the long line height (leading-7) and puts `Text`, `SectionHeading`, `SubsectionHeading` and the `Callout` text on the long-form scale inside it, body 16, h4 16 semibold, h3 20 and h2 24; every other role keeps its size, and a `Dialog`, `Drawer` or `EmptyState` inside it keeps the app sizes; it takes no `className`, `style` or size prop).
- Typography roles (each pins size, weight and ink, and takes an `as`): `Display`, `Lead`,
  `PageHeading`, `SectionHeading`, `SubsectionHeading`, `Overline`, `Text`, `Caption`. `Text` and
  `Caption` are a `<p>`; `as="span"` is their inline form, inside a row, a cell or a sentence. Opt-in props, none changing today's look: `SectionHeading rule`
  (a hairline under it, with its spacing), `SubsectionHeading size` (`sm`, `md` default, `lg`) and `truncate` (one line with an ellipsis),
  `Text strong` (font-medium in the primary ink, for emphasis), `Text preserveNewlines` (keeps a
  note's line breaks). The three inline roles (`Text`, `Caption`, `Overline`) also take `tone`, the one ink prop (`neutral`, the default, is the role's own ink;
  `muted` and `accent`, or `info`, `positive`, `warn`, `danger`, the same text colours as a `TableCell` tone; pair the colour with a word, as in "Saved."),
  `numeric` (tabular figures), `mono` (the monospace face) and `align` (`start`, `center`, `end`);
  `Text` and `Caption` also take `lines` (1 to 4, then an ellipsis, the full plain text in a
  `title`), `italic` and `breakWords` (a long URL or token breaks where its container ends).
- Controls: `Button` (`variant` is `primary` (default), `outline`, `ghost`, `link` or `dashed`, the link having no box: text with an underline on hover, for an in-line action, and the dashed one a dashed outline in muted text that fills its container, like a standalone `EmptyState`, for an "add another" row, ignoring `tone`; `icon` puts one of the `Icon` set's names before the label; `size="sm"` is compact, for table rows and toolbars, `size="lg"` larger, with more padding (see Sizes); `tone="danger"` is red, for delete and clear, and `tone="positive"` green, for accept and approve; `disabledReason` greys it flat and blocks it with `aria-disabled` while it stays in the tab order, and shows the reason as a tooltip on hover, keyboard focus and a tap, read out as its description (its native `title` in a browser without CSS anchor positioning); `busy` disables it with `aria-busy` and keeps its colour, and a string (`busy={saving && "Saving"}`) is also the label while busy; `pressed` makes it a toggle with `aria-pressed`, on `outline` and `ghost` neutral when off and filled in the tone's primary colour when on, so an `outline` `size="sm"` Button with `pressed` is a filter chip; `count` puts a small number chip after the label, part of the button's name ("Splits, 3"), and a button that opens something also takes `aria-expanded`; with `href` it is a link with the same look (through the app's `LinkProvider`), `external` opening a new tab), `ButtonGroup` (a wrapping row of buttons; `end` is one item pushed to the far side, `label` makes it a named `role="group"`), `IconButton` (a square button holding one icon of the set, `icon` (required, no children); `label` is required and becomes its `aria-label` and its tooltip on hover and keyboard focus; `variant` is `outline` (default) or `ghost`, `tone` is `neutral` (default) or `danger`, `size` matches a `Button`'s height; `count` puts a red count on its corner, not shown at 0; `disabledReason` dims it, blocks it with `aria-disabled` while it stays in the tab order, and shows the reason as a tooltip on hover, keyboard focus and a tap, read out as its description (its native `title` without CSS anchor positioning), in place of the label; with `href` it is a link, `external` opening a new tab), `Icon` (one bare `<svg>` sized to fill a box, or `name` for one of the set's own icons (`diff`, `baseline`, `review`, `ci`, `self-host`, `privacy`, `capture`, `branch`, `theme`, `speed`, `search`, `chevron-right`, `chevron-down`, `close`, `external-link`, `settings`, `bell`, `check`, `plus`, `more`, `grid`, `window`, `type`, `card`, `pointer`, `field`, `table`, `compass`, `page`, `briefcase`: feature ideas and UI glyphs on one 24 grid, a 1.5 stroke, round caps and joins, each the idea or action, not a product): `size` `sm` 14px, `md` 16px (default), `lg` 20px or `feature` 32px; `tone` is a text tone, and left out the icon takes the text colour around it; `aria-hidden` unless `label` names it as `role="img"`), `Menu` (a button that opens a short list of actions, for the overflow menu of a row, a card or a header: `label` (required) names the trigger and the menu; `items` (required) are data, each a `label` with `onSelect`, or a link with `href` (through the app's `LinkProvider`) and `external`, plus an optional `icon`, `tone` (`neutral` default, `danger` red, put last) and `disabled`; `trigger` is `icon` (default, a ghost three-dot button) or `button` (an outline button reading `label`); `size` is the trigger's height; the keyboard is the menu button pattern, and inside a `Dialog` it opens in the dialog), `ColourSchemeToggle` (a light/dark switch on `<html>`; `id`, `data-*` and other button props go on the button, `store={false}` skips `localStorage`; see Light and dark), `Input` (a text input; `icon` names a leading icon of the `Icon` set inside the field; `prefix` is short text inside the border before the value, a currency symbol, on a plain field only; `type="search"` drops the browser's search look and shows a clear button while the field has a value, named by `clearLabel` (default "Clear search")), `Textarea` (a multi-line text input, `rows` defaults to 3), `Select` (a native `<select>` in the control look over its `items`, `{ value, label, disabled? }`, keeping the browser's arrow). `Input`, `Select`, `Textarea` and `Checkbox` take a `ref` to the native element. `Input`, `Select` and `Textarea` take `size` (`md` default, `sm`: compact, less padding, for dense forms and table rows, or `lg`: larger, more padding) and `width` (`full` default, except a `Select` outside a `Field`, which is `auto`; the fixed `xs` 5rem, `sm` 7rem, `md` 9rem, `lg` 12rem, `fill`: grows to the room left in a flex row and can shrink to nothing, so the buttons beside it stay on the line, or `auto`: no width class, as wide as the browser makes it); a fixed width replaces `w-full`, so there is no class to collide with. `Input` also takes `numeric`, a field for a figure: an amount (`<Input prefix="R" numeric />`) or a count (`numeric inputMode="numeric"`), the value right-aligned in tabular figures with `inputMode="decimal"` unless you pass your own, still a text field so the value is kept as typed; never `type="number"` for a figure a person types. `size` replaces the native `size` attribute, so a multi-row `<select size={4}>` is not reachable through `Select`. `Checkbox` (a real `<input type="checkbox">` with its label, drawn by the library as an empty outlined box and a filled accent one with a check mark, so it reads the same in every theme and browser; other props go on the input; `size="sm"` is `text-xs` with a smaller box and `size="lg"` `text-base` with a larger one; the box sits on the label's first line; `checked` or `defaultChecked`, and `onChange(checked)`; with no `label` it is a bare box for a table cell, named by `aria-label`; `hint` is a muted line under the label, the box's `aria-describedby`, and `error` replaces it in red with `role="alert"` and marks the box `aria-invalid`; `disabledReason` dims it and blocks it with `aria-disabled` while it stays in the tab order, and shows the reason as a tooltip on hover, keyboard focus and a tap, read out as its description (its native `title` without CSS anchor positioning)). `Switch` (an on/off setting that acts at once, usually by saving to a server: a native `<button role="switch" aria-checked>`, with `checked` or `defaultChecked` and `onChange(checked)`; give it a `label` (the whole label is the click target) or, with none, an `aria-label`: one is required; `hint` is a muted line under the label and its `aria-describedby`, and `error` replaces it as on a `Checkbox`; `size` is `sm`, `md` (default) or `lg`; `busy` is the save in flight: `aria-busy`, a click or key does nothing, it keeps its colour and its focus; `disabled` is the native one, washed out; `disabledReason` washes it out and blocks it with `aria-disabled` while it stays in the tab order, and shows the reason as a tooltip on hover, keyboard focus and a tap, read out as its description (its native `title` without CSS anchor positioning); a value sent with a form stays a `Checkbox`). `RadioGroup` and `Radio` (one choice from a few options: the group has a `label`, `value`/`onChange` or `defaultValue`, `name`, `disabled`, `required`, `hint` (a line under the group's label), `size` (`sm`, `md` default, `lg`, as `Checkbox`) and an `error` shown like `Field`'s with `role="alert"`; each `Radio` has a `value`, a `label`, an optional `hint` and `disabled`; one tab stop, the arrow keys move and choose). `Disclosure` (a summary button with a chevron and `aria-expanded` over a body that opens and closes; `summary`, `children`, `defaultOpen`; it keeps its own state, or the app holds it with `open` and `onOpenChange`; it replaces `<details>`). `FileDrop` (a dashed drop zone, a `<label>` around a file input that covers it, so a click opens the dialog and a dropped file lands on the input; `children` is the prompt, `accept`, `multiple`, `name`, `disabled` and `onChange` on the input). `CopyButton` (a small text button that writes `text` to the clipboard and shows `copiedLabel` ("Copied") in place of `label` ("Copy") for two seconds, by a CSS animation, not a timer; its accessible name stays `label` and a status region beside it announces `copiedLabel` on each copy; every other button prop, `disabled` included, goes on the `<button>`). `CopyLine` (one line of mono text in a box with a `CopyButton` beside it; `disabled` disables the button; other props go on the root `<div>`). `Field` (a label above an `Input`, `Select`, `Textarea` or `FileDrop`, which takes the label, the hint or error as `aria-describedby`, and with an error `aria-invalid` and a red edge, by itself, so neither `htmlFor` nor the control's `id` is needed; `htmlFor` gives the control a fixed id; `labelHidden` keeps the label for assistive tech and draws no text, for a control whose purpose is plain from what surrounds it, and makes `layout="row"` a column; a `hint` sits under it, and an `error` replaces the hint with a `role="alert"` line; `span="full"` runs it across both columns of a `FormGrid`). `FormGrid` (two columns of `Field`s from `md`, one below it), `FormRow` (an inline-edit row: `FormRowField`s side by side, `actions` after them, and one `hint` or `error` under the whole row; see Layout) and `FormRowField` (a compact label over one control, `span` 1 to 4). `Callout` (a tinted notice box; `tone` is `neutral` (default), `info`, `positive`, `warn` or `danger`; `icon` sets one of the `Icon` names at the start; an optional `title` sits in bold above the body; `actions` puts a button or link at the end of the row; `banner` makes it a flat strip, bottom border only and no radius, for the top of a `Card flush`). `ToastRegion` (the page's toasts, short notices fixed to the bottom of the viewport, from a list the app holds: mount it once at the root beside `AppShell`; `toasts` (required) is the list, oldest first, each a `Toast` with `id`, `title`, an optional `body`, `tone` (a `Callout` tone, `neutral` by default) and `actions` (one `Button size="sm"`); `onDismiss(id)` (required) is called by a toast's close button and when a self-hiding toast's time is up, and the app drops it from the list; a `neutral`, `info` or `positive` toast with no `actions` leaves on its own after five seconds by a CSS animation, not a timer, paused on hover and focus and kept under reduced motion without the fade, and any other stays until dismissed; `label` names the region ("Notifications") and `dismissLabel` the close button ("Dismiss"); the region is a landmark with a polite `role="status"`, and a toast raised while a `Dialog` or `Drawer` is open sits under it). `ListRow` (a full-width row that is a `<button>` with `onClick`, or a link with `href`, with a hover fill, a left-aligned label and `trailing` content; `divided` draws a hairline above the row, to separate rows in a `Card flush`; `expanded` makes it the header of a collapsible section: `aria-expanded` and a chevron, the caller owning the state and the section; `leading` is content before the label (an `Avatar`), and `leadingWidth="thumbnail"` gives it a fixed width so rows with and without a picture line up; `size` sets the padding (`sm` dense, `md` default, `lg`); `focused` draws the focus ring on the row the keyboard cursor is on, for a list moved with the arrow keys while focus stays on the list; `selected` marks the row in view with an accent fill and `aria-current="true"`; a button or link row can hold its own link, button or `Checkbox` in `trailing`, with its own click; `secondary` is a second, muted line under the label; with no `href` and no `onClick` it is a plain `<div>`, for a row that holds its own buttons, and takes `actions`, buttons after `trailing`, and `revealOnHover`, which shows them only on hover or focus inside the row and always on a touch screen, and `panel`, content under the row lined up with the label, for a row that opens in place; a compact bordered list is `Card flush` around such rows at `size="sm"`, `divided` after the first (no separate part); `highlighted` marks the row the pointer or the keyboard is on, with a fill one step deeper than hover and the `revealOnHover` actions shown, for a list that follows both through the row's `onPointerEnter`, `onPointerLeave` and `onFocus`, which every row passes through; a button row takes `disabledReason`, which fades the row and blocks it with `aria-disabled` while it stays in the tab order, and shows the reason as a tooltip on hover, keyboard focus and a tap, read out as its description (its native `title` without CSS anchor positioning)). `SortableList` (a list the user puts in order: `label` (required) names it, and `onReorder(move)` (required) is called once per drop with a `SortableMove`, `{ id, section?, target? }`, which the app applies to its own data; the list never reorders itself; its children are `SortableSection`s (`id` (required, the move's `section`), `title`, and `emptyLabel`, "Drop here" by default, the row an empty section shows) or `SortableItem`s directly; a `SortableItem` takes an `id` (required, the move's `id` and `target`), a `title` and, as children, a meta line under it; a pointer drags the row, and the keyboard uses its grip handle: Enter, the arrow keys, Enter to drop, Escape to cancel). `Tabs` (underline tabs for switching a view in place: a row over a bottom rule, the current tab underlined in the accent; `items` are `{ value, label }` buttons, with `value` the current one's `value` and `onChange(value)` the caller's state, one tab stop and the arrow keys, Home and End moving between enabled tabs, or `{ label, href, selected?, external? }` links in a `<nav>` with `aria-current="page"` on the current one (`selected`, or the item whose `value` is `value`); `label` names the group; a button tab takes `disabled` and `controls`, the id of its `role="tabpanel"`, which is the caller's; `orientation="vertical"` is the pill rail instead, the current tab filled, with no rule, stacked in one column for a `SidebarLayout` `aside`, and only the rail takes `size`; there is no `variant`: across is always underline, a `PageHeader` `tabs` slot and an `AppShell` `nav` included; `disabled` on the row disables every tab, e.g. until hydration). `SegmentedControl` (a joined pill group, one option filled; the same `items`, `value`, `onChange`, `disabled` and `label` as `Tabs`, as a `radiogroup` with `aria-checked` on each `radio`). On both an item takes `data-*` attributes (typed `data-${string}`) onto its button or link; on `Tabs` and `SegmentedControl` an item takes `count` (a small muted number after the label, part of its name: "Shots 12") and `title`; a button option takes `disabledReason`: it is `aria-disabled`, the arrow keys reach it and choose nothing, and the reason is its tooltip on hover, keyboard focus and a tap, read out as its description; a bare `disabled` option is `aria-disabled` too, and the arrow keys, Home and End skip it. `Dialog` (a modal on the browser's `<dialog>`, opened on mount, so render it only while open: `title` is its name, `description` a line under it, `footer` the right-aligned actions; Esc, the backdrop or a `<form method="dialog">` call `onClose`; `width` is `sm` (320px, a list), `md` (440px, default, a form), `lg` (640px, a wider form or a table) or `full` (the whole screen, for media or a player: the body fills the height between the title and the footer and scrolls if taller; there is no backdrop to click, so put a close button on a `<form method="dialog">` in the `footer`); `onSubmit` makes it a form (one `<form noValidate>` round the body, the `error` and the footer, so a submit button or Enter submits; no `<form method="dialog">` in its footer then); `error` is the whole submit's error, a danger `Callout` above the footer). `FieldDialog` (a `Dialog` with one text field and Cancel and submit buttons, every string passed in: `title`, `description`, `label` (which names the input), `placeholder`, `hint`, `emptyReason`, `submit` and `busyLabel`; `onSubmit` gets the trimmed value and a resolved promise closes it, a rejection shows its message). `Drawer` (a modal slide-over on the right edge, on a native `<dialog>` opened on mount like `Dialog`, so render it only while open: `title` is its name, `description` a line under it, a close button sits beside it, `children` scroll between the header and an optional pinned `footer`; Esc, the scrim and the close button call `onClose`; `width` is `sm`, `md` (default) or `lg`; `closeLabel` names the close button). `Pagination` (page links for a long list, in a `<nav>` named by `label` (required): `page` (from 1, drawn clamped into range) of `pageCount` (one page draws nothing), each page a link to `pageHref(page)` through the app's `LinkProvider`, so the page lives in the URL; Previous and Next in the outline `sm` look, plain text at the first and last page; a window of at most seven numbers (the first, the last, the current and its neighbours, `…` for a run of hidden pages), the current one `aria-current="page"`; below `sm` the numbers give way to `pageLabel` ("Page 4 of 12"); `previousLabel` and `nextLabel` for another language). `Breadcrumbs` (a `<nav>` named by `label`, "Breadcrumb" by default, over an ordered list; `items` are nodes, or `{ label, href, external? }` for one that links; the last is the current page and is never a link and gets `aria-current="page"`, and each crumb truncates). `Table` (a list of records in a rounded, bordered card around a full-width `<table>` that scrolls sideways on a narrow screen; `label` (required) names it for assistive tech and is not drawn; a `TableHeaderCell` with `sort` and `onSort` makes its column sortable (the app sorts the rows), `TableRow selected` marks the row whose detail is open (`aria-current`), a `TableExpandCell` opens a row whose panel is a `TableCell span="full"`, and `TableBody empty` takes an `EmptyState` across every column; `size` is the row padding, `sm` by default, and the buttons and pills in its rows take the same size; inside a `Card` it is plain: no card of its own, no head strip and no row hover, only the row dividers; compose it from `TableHead`, `TableBody`, `TableFoot`, `TableRow`, `TableHeaderCell` (`numeric` declares a column of figures once, so the title and every cell under it are end aligned and the cells in tabular figures; `align` `start`, `center` or `end`; `label` is a visually hidden column name, in place of children, for a column of row actions: "Actions") and `TableCell` (`align`, `indent` of 1 to 3 to set a start-aligned cell in, for a line under a parent row, `tone` `neutral` (the default), `strong` or `muted`, or the tones `info`, `positive`, `warn` or `danger` for an amount that means something, in the tone's text colour and with no fill, so pair the colour with a sign or a word; `numeric` for a figure, end aligned in tabular figures (a cell under a `numeric` head cell is one already), `mono` for a small mono face, `truncate` to cap a long value's width, cut it with an ellipsis and put the full text in a `title`, so its content is text (strings and numbers); `secondary` for a second, muted line under the content; `colSpan` passes through, so a `TableCell` with `colSpan` in a row of its own is a full-width panel, an empty state or a note, centred with `align="center"`); `TableEditCell` (a `TableCell` whose value opens an editor in place: `children` is the value, drawn as a button; a click, Enter or Space swaps it for `renderEditor(close)`, a plain control in the cell and not a popover of its own, and moves the focus into it; `close` and Esc put the focus back on the value, and a press outside or Tab out of it closes it too, so the control saves on its own change or submit; `label` names the button and the editor; it takes the `TableCell` props except `truncate`); `InlineEdit` (the same edit trigger without the cell, for a `TableCell` that holds other content too: `label`, `renderEditor(close)` and `children`, with the same keyboard and focus behaviour); `TableFoot` (the `<tfoot>` for totals: its cells are strong by default and each row has a firmer line above it, alone and in a card alike); `TableGroupRow` (a full-width group header in the body: `label` spans `colSpan` columns, the table's column count, which is required; optional `trailing` content sits at the far end, and the group's rows follow it); `tone` on a `TableRow` in the body marks the row with a stripe on its leading edge over a soft fill: `neutral`, `info`, `positive`, `warn` or `danger`, as `Callout`, or `muted`, which only fades the row (a transfer, a row that is not the point); a bold subtotal is not a tone: `emphasis` on a `TableRow` in the body gives it a `TableFoot` row's look among the other rows; `stripe` (a text tone) draws the leading stripe alone, with no fill; a row takes one of `tone`, `stripe` and `emphasis`; `selected` on a `TableRow` marks the current one with the `ListRow` selected fill and `aria-current`, and wins over a tone; every table element passes `id`, `data-*` and `aria-*` through, and none takes a `className` or `style`). `Timeline` (a named `<ol>` of events; `label` is its `aria-label`, `empty` is drawn instead when there are no items) with `TimelineItem` (a `title`, an already-formatted `time`, the `children` as a note, and `tone`, a Callout tone for the marker dot, `neutral` by default). `KeyValueList` (a `<dl>` of label/value rows; each `KeyValue` takes a `label` and its value as children, the value right-aligned in tabular figures; `total` makes it the sum row, a firm rule above and strong text, and `tone` (a text tone: `muted`, `accent`, `info`, `positive`, `warn`, `danger`) colours the value on any row, so `total tone="warn"` is a total that does not reconcile; `align="start"` puts the values left-aligned in one column beside the labels instead). `Avatar` (a badge of the initials of `name`, titled with the name and `aria-hidden`; with `src` (the app's own local image path, never a remote one) it is a cropped `<img alt={name}>` instead, and if that image fails to load it shows the initials; `size` is `xs` (16px, for an inline mention), `sm`, `md` (default), `lg`, `xl` (56px), `2xl` (64px) or `3xl` (96px); `onClick` makes it one button named by `name`; `shape` is `round` (default, a person) or `square` (an org or a team); `href` makes it one link (`external` too); a row of overlapping avatars is an `AvatarStack`; the colour is one of seven stock background classes picked by a hash of the name, remapped by each theme). `TextLink` (an inline text link in the accent colour; `href` is required and an in-app one goes through the app's `LinkProvider`, `external` adds `target="_blank"` and `rel="noreferrer"`, `stretch` covers the nearest `relative` ancestor so a whole row or card is the click target, `size` (`sm`, `md` or `lg`) pins the type size where it would otherwise follow the text around it, `mono` sets the monospace face, `tone` (`warn`, `danger`, `positive`, `info` or `muted`) gives it a meaning's colour in place of the accent (`neutral` and `accent` keep the accent), every other anchor prop passes through). `MetaList` (a wrapping row of facts or links in muted small text, joined by an `aria-hidden` `separator`: `·` (default), `•` or `none`; branch · SHA · date, or a footer's Privacy · Terms; an item is text, a `Code` or a `TextLink`, and never breaks inside itself; `mono` sets the row in the monospace face, for ids and paths). `PageFade` (the page's content area, named for the View Transitions API so a route change cross-fades it while the frame around it stays put; wrap what changes between pages, once per page, or give each a `name` (a CSS identifier) when there are two; it fades when the navigation runs in a view transition, through `startPageTransition(update)` (flushes a synchronous state change inside `document.startViewTransition`) or a router's own option such as TanStack Router `viewTransition`, and otherwise, in a browser without View Transitions, or under `prefers-reduced-motion: reduce`, it swaps with no fade; it renders a small `<style>`, with no colour in it, and the div is a stacking context, so portal an overlay that must rise above the frame). `NavigationProgress` (a thin indeterminate accent bar fixed along the top edge of the viewport, over the header, for a route change under way; `loading` is the router's pending flag (TanStack Router: `useRouterState({ select: (s) => s.status === "pending" })`), `label` its accessible name (default "Loading page"); it draws the bar while `loading` is true and nothing otherwise, with the bar invisible for its first 150ms so a fast navigation shows nothing; render it once per app, beside the page frame, and pair it with `PageFade`; a still bar under `prefers-reduced-motion: reduce`; it adds nothing to the layout and has no router dependency). `EmptyState` (what a page or list shows when it has nothing yet: a centred `title`, the `children` as the explanation under it, and `actions` in a centred row; a named `<section>`, which draws its own dashed frame on its own and none inside a `Card`; `icon` sets a mark above the title; `level` is the title's heading level, one below the heading that holds it, and does not change its look; for one muted line inside a card, `Text tone="muted"`). `Steps` (a numbered `<ol>` of `Step`s, each a `title` and the `children` as a detail line, the numbers counted by CSS in an accent disc; for a "get started" list, not for progress). `Divider` (a hairline `<hr>` in the theme's line colour; spacing comes from the layout around it). `BulletList` (a `<ul>` with discs, an indent and a small gap; its children are `BulletItem`s, each an `<li>` in the body text). `Code` (inline code: mono, on a subtle background). `CodeBlock` (a block of code, no client JS: the text is `children` (a string) or `lines` (one entry per line), `language` (`text` (default, one colour), `tsx`, `ts`, `js`, `json`, `bash`, `console`, `css`, `html` or `yaml`) colours it, `console` being a shell session where a `$ ` line is a command and the rest is output, and `copy` then copies only the commands; `label` is a caption naming the language or file; long lines wrap by default, so nothing is cut off and a command copies as one line, and `overflow="scroll"` keeps lines whole and scrolls them under a thin scrollbar in the theme's muted ink; `copy` adds a copy button beside the code, which copies it exactly as given; on a static page it needs `copyScript` (see Copy on a static page); other props go on the root `<figure>`). `CodeExample` (one framed example: the rendered `children` over the `code` that makes them, coloured as TSX, in one bordered box, with an optional `caption` as its last band; a wide preview or long code scrolls inside the frame under the same thin scrollbar; `copy` adds a button that copies the code; no client JS without `copy`). `Video` (a full-width, rounded `<video>` with controls that loads metadata only; `src` is required, `poster` and a WebVTT `captions` track are optional, children are the fallback). `Kbd` (a keyboard key in mono; its border takes the surrounding text colour, so it reads on a filled button too). `Fieldset` (a `<fieldset>` named by its `label`, drawn as its legend in the `Field` label's look, over its children in one column: `Checkbox`es for one question, `Field`s in a `FormGrid`, or a `ButtonGroup` of `outline` `sm` `Button`s with `pressed` for filter chips; `hint` is a muted line under it and its `aria-describedby`, `error` replaces it in red with `role="alert"`; `disabled` disables every control inside; a `RadioGroup` is its own group and never goes in one). `DateField` and `DateRangePicker` (see Dates).
- Dates: `toISODate`, `fromISODate`, and the `CalendarDate` type.

## Loading

A part waiting for its data draws its own shape. Set `loading` once, on the page layout, and render
the tree you render with data:

```tsx
<ListLayout title="Quotes" loading={q.isPending}>
  <StatTile label="Open" value={q.data?.open} />
</ListLayout>
```

What a part has is drawn as itself and an empty slot (`null`, `undefined`, `false`, an empty string
or array) is a bone of that slot's shape, so the caption stays and a bone stands where the figure
will land. A container with nothing in it draws a fixed set (a `Table` five rows, a `Card` three
lines, a `CardGrid` one card per column, a `Timeline` three items), and loading beats `empty`. A
part's own `loading` wins; left out, it takes the nearest loading layout's or part's, and
`loading={false}` opts it out. The owner (the part or layout whose own `loading` is `true`) sets
`aria-busy` and holds one hidden label, `loadingLabel` ("Loading"). Bones pulse only when the reader
allows motion. Actions, navigation, bare controls and frames are known before the data and draw as
themselves; the docs' Loading page lists every part either way. There is no `Skeleton` part.

## Dates

```tsx
import { DateField, fromISODate, toISODate, type CalendarDate } from "@slashsuite/ui-react";

<DateField
  calendar
  label="Date of birth"
  hint="DD/MM/YYYY"
  defaultValue={fromISODate("1990-05-17")}
  maxValue={fromISODate("2026-10-23")}
  onChange={(date: CalendarDate | null) => save(toISODate(date))}
  name="dob"
  required
/>;
```

- `DateField` is a segmented DD/MM/YYYY field (always en-GB, whatever the browser's locale).
  `calendar` adds a calendar button. The popover has ‹ › month steps, month and year dropdowns,
  Monday-first weeks and a Clear action. `defaultOpen` opens it on mount.
- Without `calendar` it is typed only, for a date the person knows by heart.
- It takes `label`, `hint`, `error`, `value` / `defaultValue` / `onChange`, `minValue`,
  `maxValue`, `disabled`, `required`, `size` and `name` (the form posts `YYYY-MM-DD`). With `calendar`,
  `monthLabel` and `yearLabel` name the dropdowns (default `Month` and `Year`).
  Values are `CalendarDate`s (from `@internationalized/date`, re-exported as a type).
- `toISODate(date)` gives `"1990-05-17"` (`""` for `null`); `fromISODate(text)` gives a
  `CalendarDate`, or `null` for a malformed or impossible date such as `"1990-02-31"`.
- `onChange` reports what the field shows: the date once it is complete, exists and is within
  `minValue` / `maxValue`. When a valid date is edited into one that is not, it reports `null` once
  and `name` posts `""`, so a controlled parent holds `null` until the date is fixed (holding it does
  not clear what was typed). Fixing it reports the date again. A `value` the parent sets is shown,
  not reported back.
- With `required`, a partly filled date blocks the form and shows "Enter the whole date." once
  the field loses focus.
- A date before `minValue` or after `maxValue` stays as typed (it is never clamped) and shows the
  error once the field loses focus.
- An impossible date such as 31/02/1990 shows "February 1990 has 28 days." and stays exactly as
  typed, focus leaving included, until it is fixed.
- `error` is an error from outside the field, a server's say: it shows in place of the hint, in
  red with `role="alert"` (as `Field`'s `error` does), and marks the field invalid. It wins over
  the built-in messages; clear it when the date changes.
- `DateRangePicker` is a from and to date in one field, DD/MM/YYYY "to" DD/MM/YYYY, with a
  calendar button that opens one month, where two presses pick the range.
- Its value is a `DateRange`, `{ start, end }`, or `null`; `onChange` reports a range only when both
  sides are complete, real, within `minValue` / `maxValue` and in order, and `null` otherwise.
  `startName` and `endName` post each side as `YYYY-MM-DD`, or `""` while there is no range.
- `presets` are `DateRangePreset`s, `{ label, value }`, a row of buttons above the month. The app
  builds them from its own today; the picker never reads the clock.
- `label`, `hint`, `error`, `minValue`, `maxValue`, `required`, `disabled`, `size`, `defaultOpen`,
  `monthLabel` and `yearLabel` work as on a `DateField`.

## Router links

`@slashsuite/ui-react` has no router dependency. The app names its router's link once, on a
`LinkProvider`, and every part that links (`Button`, `IconButton`, `TextLink`, `Pill`, `Card`,
`ListRow`, `Breadcrumbs`, `Tabs`, `SegmentedControl`, `AppShellBrand`, `SiteSearch`, `MediaTile`,
`Avatar` and the status pages) takes a plain `href`. Do: set the adapter once, at the router.
Don't: a render prop or a wrapper component per link.

```tsx
// TanStack Router: InnerWrap also wraps the not-found and error components. A registered
// router's Link requires `to`; `to="."` satisfies it, and the `href` the adapter is handed wins.
const router = createRouter({
  routeTree,
  InnerWrap: ({ children }) => (
    <LinkProvider link={(p) => <Link to="." {...p} />}>{children}</LinkProvider>
  ),
});

// React Router, inside the router:
<LinkProvider link={({ href, ...p }) => <Link to={href} {...p} />}>…</LinkProvider>

// Then anywhere:
<Tabs label="Main" items={[{ label: "Quotes", href: "/quotes", selected: true }]} />
<Button variant="ghost" href={`/stores/${encodeURIComponent(id)}?tab=stock#top`}>Back</Button>
```

Only an in-app path (one that starts with a single `/`) reaches the adapter. An `external` link, a
full URL (`https:`, `mailto:`, `tel:`), a `//` URL, a `#hash` and a relative path are a plain `<a>`.
With no provider (Astro, or a site with no router) every link is a plain `<a>`, which Astro's
`ClientRouter` intercepts on its own. A per-link `viewTransition` becomes `defaultViewTransition`
on `createRouter`.

`home` on the same provider is where every status page's "Back to home" goes, `/` by default:
`<LinkProvider link={...} home="/app">`, or `<LinkProvider home="https://example.com">` with no
`link` for a site whose home is elsewhere. Since `InnerWrap` wraps the router's not-found and error
components, the router setup is the one place an app wires its status pages. A provider inside
another keeps what it does not set.

The adapter is handed `LinkAdapterProps`: `href`, `className` and `children`, plus `aria-current`,
`target`, `rel` and `title` when there is one. Each optional field is `?: T` and an absent one is
left out, never set to `undefined`, so the spread compiles on a router `<Link>` that declares its
props the same way under `exactOptionalPropertyTypes` (TanStack Router's does). Any other anchor
prop you gave the component (`id`, `download`, a handler) is handed over too. The class strings are
not exported: the adapter is the one way to draw a router link.

## Layout

One content edge for every page, so nothing moves sideways between pages or viewport sizes.

```tsx
import {
  AppShell,
  AppShellBrand,
  PageHeader,
  Section,
  Stack,
  Tabs,
  appShellRootClassFor,
} from "@slashsuite/ui-react";

// Your root layout. `appShellRootClassFor` adds `overflow-y-scroll`: it reserves the scrollbar, so
// a short page and a long one centre their content at the same x. AppShell cannot set it itself.
<html className={appShellRootClassFor("light")}>
  <body>
    <AppShell
      brand={<AppShellBrand logo={<Logo />} label="Builds" href="/" />}
      nav={<Tabs label="Main" items={nav} />}
      footer="…"
    >
      <PageHeader title="Builds" description="Every build" actions={<Button>New</Button>} />
      <Stack>
        <Section title="Recent">…</Section>
      </Stack>
    </AppShell>
  </body>
</html>;
```

- **`AppShell`** is the page frame: a sticky header that is one `h-14` row on a phone and, from
  `md`, an `h-14` row plus an `h-12` `subnav` row. On a phone `nav` and `subnav` fold behind one
  **Menu** button (a native `<details>`, so it opens with no JavaScript, on the keyboard and for a
  screen reader; Escape closes it and a followed link closes it). The panel hangs below the header
  and never changes its height, nothing wraps and nothing scrolls sideways. `menuLabel` renames the
  button (default `Menu`). From `md` the nav and the subnav are rows again (a row wider than the
  screen scrolls sideways, never wraps, and the edge with more to reach fades out). `main`
  has fixed `py-8`, and an optional `footer`. The header row is filled by slots, left to right:
  `brand` (logo and name, at the brand type with the logo gap), `nav` (`Tabs` of links), `header` (a
  free node for what no other slot covers; prefer `brand`, `nav` and `controls`) and `controls` (end-aligned, `gap-2`, centred): no wrapper and
  no styling. Nothing in `controls` shrinks, and a full-width control there (a `Select` with
  `width="full"`) sizes to its content, so a `Select` next to a `ColourSchemeToggle` leaves
  the toggle its square. `printChrome={false}` is opt-in: the header and footer are hidden in print and main
  drops its padding (the page margin is then your `@page`); without it a print is unchanged. `bleed` drops main's `Container` for a full-bleed
  page; the header keeps its own, so put a `Container` back around anything that should line up. `density="compact"`, set once here and nowhere else,
  puts the whole app one type step down: `Text` 14px, `Caption` 12px, the headings and the controls one
  step smaller. Left out, text is 16px, as a site's.
- **`AppShellBrand`** is the `brand` slot as one link: `logo` and `label` inside the same `<a>`, so
  the whole brand goes home (the label names the link; the logo is hidden from assistive tech).
  `logoSize` is `sm` (20px), `md` (24px, the default, an `Avatar size="sm"`) or `lg` (32px); an
  `<img>` or `<svg>` logo fills it. Its `href` goes through your `LinkProvider`, as every link does:

  ```tsx
  <AppShell brand={<AppShellBrand logo={<Avatar name="Quotes" size="sm" />} label="Quotes" href="/" />} …>
  ```

  Stories: `Layout/AppShell › DoBrand`, `DoRouterBrand`.
- **`appShellRootClassFor(scheme, schemes?)`** is what goes on `<html>` when the server knows the
  scheme: that scheme's class and `overflow-y-scroll`, joined, so there is no string concatenation:
  `<html className={appShellRootClassFor(scheme, schemes)}>`. With no scheme, pass `"light"`.
  `schemeClass` stays exported.
- **`Container`** is the only place the content width (`max-w-6xl`) and side padding
  (`px-4 sm:px-6`) are defined. **Pages never set their own width or outer padding**: no `max-w-*`,
  no `mx-auto`, no `px-*` on a page. AppShell already gives them the edge.
- **`PageHeader`** is the top of every page but a landing page (that one opens with a `Hero`): optional `breadcrumbs`, the `title` (a `PageHeading`),
  `description`, `actions` (right of the title from `sm`, under it on a phone) and `tabs` under it. Its
  fixed bottom margin puts every page's first block at the same y.
- **`Hero`** is a landing page's top block, once per page and only there; every other page opens
  with a `PageHeader`. It takes an `overline` (the small mono label), the `title` (the page's `h1`,
  at `Display` size) and `children`: a `Lead`, and the page's first actions in a `Cluster` if it has
  any (a primary `Button` and an `outline` or `ghost` one in the default tone, or a `TextLink`: the
  text each theme's contrast check holds over the glow). Behind the text drift three soft ribbons of the theme's glow, in its own colours and strength
  (faint on a paper theme), anchored to the text column and clipped to it, so a phone never scrolls
  sideways. The glow is `aria-hidden`, stands still under `prefers-reduced-motion: reduce`, and is
  markup plus one small `<style>` with no colour in it, so it needs no script. It takes no colour,
  size or styling prop.
- **`Stack`** spaces blocks in a column: `gap="xs"` (`gap-2`) between lines of one text block (a
  heading, the line under it), `sm` (`gap-4`) inside a group, `md` (`gap-6`) between
  blocks, `lg` (`gap-8`) between groups, `xl` (`gap-12`, `sm:gap-16`) between a page's top-level blocks. Left out, the gap comes from where it sits: `xs` inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, `md` on the page. Use it instead of `space-y-*`. `width` caps the column:
  `narrow` (`max-w-3xl`, a reading measure), `wide` (`max-w-5xl`), `full` (`w-full`) or `default`
  (nothing). A capped Stack starts at the Container's start edge and is never re-centred.
  `rowFrom` (`sm`, `md` or `lg`) lays the blocks out in a row from that breakpoint and keeps the
  column below it, a main block beside a side panel that stacks on a phone; a row that is a row at
  every width is a `Cluster`.
  `as` is `div` (default), `section`, `form`, `ul` or `ol`, and nothing else. A `form` Stack takes
  the form props (`onSubmit`, `action`, `method`, `noValidate`, `aria-*`, `data-*`). A `ul` or `ol`
  Stack has no markers and its children are `<li>`s (the Stack does not wrap them, as with
  `BulletList` and `Timeline`; `Text as="li"` works).
  **`Section`** is a `<section>` Stack (its gap as a `Stack`'s) with an optional `SectionHeading` `title` (an `h2` on the page, one below the section that holds it, `level` to set it),
  `actions` beside it and the same `width`.
- **`Cluster`** spaces items in a row, the counterpart of `Stack`: `gap` is `xs` (`gap-2`), `sm`
  (`gap-4`, the default) or `md` (`gap-6`), `align` the cross axis (`center` (default), `baseline`,
  `start` or `end`), `justify` the main axis (`start` (default), `between` or `end`), and the row
  flows onto more lines when it runs out of room (`wrap={false}` keeps it on one line). Wrap the one item that
  should take the room left in **`ClusterGrow`**, an input beside its buttons say: it can shrink to
  nothing, so the items beside it stay on the line; `minWidth` (`sm` 12rem, `md` 17rem) gives it a
  floor instead, so in a Cluster that wraps it drops under the others rather than squashing. An empty `ClusterGrow` is a spacer that pushes
  what follows it to the end. `ButtonGroup` stays the row for buttons; `Cluster` is any other row.
  It is a separate part, not `Stack direction="row"`, because a row has no `lg`, `xl` or
  `width` and a column has no `align` or `justify`.
- **`FormGrid`** is the two-column form: `Field`s in two columns from `md`, one below. A `Field`
  with `span="full"` (a textarea, a long hint) runs across both. **`FormRow`** is an inline-edit
  row of **`FormRowField`**s (a compact `text-xs` label over a control; `span` 1, 2, 3 or 4 is its
  share of the row, so 2, 1 and 1 give a half and two quarters) with optional `actions` after
  them (a save button, kept at its own width). Every control sits on the bottom edge, so the actions
  line up with them, and under `md` the fields and the actions stack. A `FormRow` is always the full
  width of a `FormGrid`. Its `hint` or `error` (which replaces the hint, `role="alert"`) sits under
  the whole row; a `FormRowField` has no note of its own, so the controls beside each other stay
  level. Closed spans, no `col-span` or width to pass.

- **`CardGrid`**: use this for stat tiles or a gallery of cards, inside a page layout. `columns` is `2`, `3` (default) or
  `4`: one column on a phone, two from `sm`, `columns` from `lg`. `columns="auto"` instead fits as
  many per row as the width allows, each at least `minWidth` wide: `md` (17rem, default) or `sm`
  (12rem); `minWidth` is only for `auto`. Every tile is one width: a main card beside a narrower one is a `SideColumn`. `align="start"` keeps each card its own height; the
  default stretches every card to the tallest in its row. `as="ul"` makes it a list, each child
  wrapped in an `<li>`.
- **`SideColumn`**: use this when part of a page is a main area beside a side column of a known width,
  such as a thread beside an assistant. `children` are the main area and `aside` the column; from `lg`
  the aside is `asideWidth` wide on the right (`sm` 18rem, `md` 24rem, the default) and the main area
  takes the room left, and below `lg` the aside stacks under it. `asideLabel` folds the aside, closed,
  behind a native disclosure of that name below `lg` (the aside stays mounted, so state inside it is
  kept) and names the `<aside>` landmark; from `lg` it is the same column, always shown. It sets no page width, padding or header of
  its own, so it sits inside a layout or a card; a share of a page under a `PageHeader` is
  `DetailLayout`'s aside. A `Stack` with `rowFrom` and a `ClusterGrow` sizes the side by its content
  and is not a fixed column. A grid of fields, one row per item, is a `Table` in a `Card`.

### Page layouts

Small compositions of the above: they take slots, own no data, and set no page width or outer
padding. `ListLayout`, `DetailLayout`, `FormLayout` and `ProseLayout` take the `PageHeader` props
(`title`, `description`, `actions`, `breadcrumbs`, `tabs`), and `CenteredLayout` its `title` and
`description`.

- **`ListLayout`**: use this when a page is a filterable list. `filters` sits under the header;
  `children` is the list, replaced by `empty` when there are none.
- **`DetailLayout`**: use this when a page is one thing with facts beside it. `children` take two
  thirds from `lg` and `aside` one third; below `lg` the aside stacks under the main column.
  `sticky` (off by default, since an aside of ordinary cards may be taller than the screen)
  keeps the aside in view from `lg` as a long page scrolls: it sticks under the shell's header and
  scrolls itself when it is taller than the room left.
  `asideLabel` names the aside's landmark (it never folds it), for a page with another complementary
  landmark.
- **`FormLayout`**: use this for a create or edit page. A `max-w-3xl` `<form>` that starts at the
  Container's start edge (it is not re-centred, so the title does not jump), with an `actions` row at
  the end. Other props (`onSubmit`, `action`) go on the `<form>`.
- **`ProseLayout`**: use this for a text page (privacy, terms, a CV, an about page). One `narrow`
  (`max-w-3xl`) column that starts at the Container's start edge (not re-centred, so the title does
  not jump): the header, then `children` in a `Stack` (`gap` prop, `md` by default). Unlike
  `FormLayout` the header sits inside the column, so its `actions` stay beside the text.
- **`SidebarLayout`**: use this when a rail of navigation, its `aside`, sits beside the content. Render it in a
  plain `<AppShell>`, no `bleed`: it sits in the Container like every other layout, so the rail
  starts at the header logo's x and the canvas ends at the header's right edge. The rail has no fill
  and no border (pill `Tabs` with `orientation="vertical"` is its content); from `md` it is `md:w-56` beside
  the canvas, and below `md` it stacks above it. From `md` the rail also stays in view under the
  shell's header as a long page scrolls (always, with or without `asideLabel`); a rail taller than
  the screen scrolls itself, so its last link is reachable. A long rail sets `asideLabel`: below `md`
  the rail then folds, closed, behind a disclosure of that name, so a phone shows the page first;
  `asideLabel` also names the rail's `<aside>` landmark.
- **`FullBleedLayout`**: use this for a viewer that needs the whole width. Render it in
  `<AppShell bleed>`; `children` fill the width, and an optional `aside` takes `lg:w-72` on the
  right and stacks below under `lg`. It adds no padding, so a viewer fills the width; set `padded`
  for a body that is not a viewer, which gives the canvas the other layouts' page padding. A `bar`
  (a viewer's title and actions) runs full width above both on the surface with a bottom line, and
  sticks under the shell's header as the page scrolls; `padded` does not pad it. `asideLabel` names
  the `<aside>` landmark.

  **`FullBleedLayout` deliberately breaks the shared start edge from `lg` up.** An edge-to-edge
  viewer needs the viewport's edges, so it cannot sit inside the Container the header uses. At
  1280 px the header logo and every other layout start at x=88, `FullBleedLayout`'s `children` at
  x=0 (unless `padded`). Below `lg` it stacks and agrees with the other layouts. To avoid the shift
  between pages, give a whole section of an app the same layout rather than mixing it with
  `ListLayout` pages that a user moves between; the header, which stays inside the Container, is
  the constant. The title's y also
  differs from `ListLayout` only when one page passes `breadcrumbs` and the other does not:
  `PageHeader` puts them above the title in every layout.
- **`CenteredLayout`**: use this for sign-in, landing, not-found and error pages. A `max-w-md` card
  centred at a fixed offset from the top; the one layout that does not share the start edge.

```tsx
<AppShell brand={<AppShellBrand logo={<Logo />} label="Quotes" href="/" />} nav={nav}>
  <ListLayout title="Quotes" actions={<Button>New</Button>} filters={<Fieldset …/>}
    empty={<EmptyState title="No quotes yet." />}>
    {quotes.map(…)}
  </ListLayout>
</AppShell>
```

## Copy on a static page

`CopyButton` copies from a React click handler, so on a page rendered to static HTML and never
hydrated (an Astro page whose body is not an island) it draws and does nothing. Inline `copyScript`
once, as you do `colourSchemeScript`, and every copy button works there, `CopyLine` and a `CodeBlock`
or `CodeExample` with `copy` included. It is one click listener on `document`; in Astro, use
`<script is:inline set:html={copyScript} />`. A hydrated button and the script share each click and
copy it once between them, so the script is safe on a hydrated page too.

## Light and dark

A dark theme does its colour work under `.dark`; this only decides whether `.dark` is on `<html>`.
Two states, light and dark. The stored choice wins; with nothing stored the system's
`prefers-color-scheme` decides. Which dark theme is loaded stays your CSS import.

1. **Inline `colourSchemeScript` in `<head>`**, before the stylesheet, so the class is right at
   first paint and neither scheme flashes the other. It is a few hundred bytes of plain JavaScript:

   ```tsx
   import { colourSchemeScript } from "@slashsuite/ui-react";

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
   import { ColourSchemeToggle } from "@slashsuite/ui-react";

   <ColourSchemeToggle onChange={(scheme) => track(scheme)} />;
   ```

   It is an icon button showing the scheme you would switch *to* (a sun on a dark page, a moon on a
   light one), labelled "Switch to light theme" / "Switch to dark theme". A click applies the scheme
   to `<html>` and stores it under `localStorage["hackcove:colour-scheme"]`; a storage error (private
   mode) is swallowed and the page still switches. It reads the current state from the `dark` class
   when it mounts, so it agrees with the script and renders the same on the server and the client.
   It draws both icons and a small `<style>` shows one from the class on `<html>`, so a dark visitor
   with no cookie and no `defaultValue` sees the sun from the first frame, not the server's light-page moon;
   the button's name is drawn the same way (both names are in the markup, visually hidden, and the
   rule hides the wrong one), so a screen reader hears the right one before hydration too, with no
   script. Only the tooltip waits for hydration.

4. **A light theme with a class of its own, or a scheme the server knows.** An app that picks the
   scheme from a cookie and whose light theme has a scope class passes both:

   ```tsx
   import { ColourSchemeToggle, schemeClass } from "@slashsuite/ui-react";

   const schemes = { light: "my-light", dark: "dark" }; // default: { light: "", dark: "dark" }

   <html className={schemeClass(scheme, schemes)}>
   <ColourSchemeToggle schemes={schemes} defaultValue={scheme} onChange={(next) => saveCookie(next)} />
   ```

   Leave `colourSchemeScript` out here: it knows only the `dark` class and the stored choice, so it would fight the server. `schemes` is the class each scheme puts on `<html>`; a click swaps them. `defaultValue` is the scheme the
   server rendered: the server markup, the hydrating client and the `<html>` class (from
   `schemeClass`) then agree, with no flash. Persist the choice from `onChange`; the toggle still
   writes `localStorage`, which an app reading a cookie simply ignores. With neither prop nothing
   changes: `dark` on and off, light on the server.

   **Persisting to a cookie instead of `localStorage`.** Pass `store={false}` (default `true`) and write the
   choice from `onChange`; the toggle then touches no storage at all:

   ```tsx
   <ColourSchemeToggle
     store={false}
     defaultValue={scheme} // read from the cookie on the server
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

From the workspace root: `bunx moon run ui-react:typecheck ui-react:lint ui-react:test ui-react:build` and
`bunx moon run ui-react:pack-check` (the tarball is `dist/` plus `package.json`, `README.md`, `LICENSE`; it also typechecks the tarball in a
consumer app: `scripts/consumer-types.ts`).
The stories live in `apps/storybook`.
