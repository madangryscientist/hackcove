# Migrating @hackcove/ui-react

## 0.10 to 0.11: one API pass

Each idea has one name, one value set and one default. Every old name below is gone in 0.11, with no
alias. A codemod rewrites the mechanical swaps (marked **codemod** below) and prints a `file:line`
for each one a person has to decide (marked **by hand**); how to run it is at the end of this section.

### Tone, text and passthrough

There is one tone vocabulary, `Tone` (`neutral`, `info`, `positive`, `warn`, `danger`), exported
from the package. `neutral` is every default. `tone` is the one ink prop on `Text`, `Caption` and
`Overline`; their `TextTone` adds `muted` and `accent`.

| Old | New | |
| --- | --- | --- |
| `import type { CalloutTone }` | `import type { Tone }` | codemod |
| `Callout` with no `tone` (was `info`) | `neutral`; write `tone="info"` to keep the blue box | codemod pins `tone="info"` |
| `Text color="muted"` (and `Caption`, `Overline`) | `tone="muted"`, one step darker (`text-slate-500`) | codemod |
| `color="tertiary"` | `tone="muted"` (the same ink) | codemod |
| `color="brand"` | `tone="accent"` | codemod |
| `Text color="secondary"` | nothing: it is the default | codemod |
| `Caption color="secondary"`, `Overline color="secondary"` | no swap: pick `tone` or leave the role's ink | by hand |
| `color="default"` on an inline role | no exact swap: `Text strong` adds the weight in the primary ink | by hand |
| `color` on `Display`, `Lead`, `PageHeading`, `SectionHeading`, `SubsectionHeading` | removed: each heading has its fixed ink | by hand |
| `TypographyColor` | removed | by hand |
| `Text` and `Caption` are a `<span>` | a `<p>`; `as="span"` is the inline form, inside a row, a cell, a button or a sentence | codemod drops `as="p"` and pins `as="span"` where there is no `as` |
| `Icon tone="inherit"` | leave `tone` out | codemod |
| `ProgressBar`, `SplitBar`, `StatTile` `tone="negative"` (and `toneA`, `toneB`) | `danger` | codemod |
| `StackedBar`, `Legend`, `TrendChart` `tone: "violet"` | `accent`, the theme's accent ink | codemod |
| `StackedBar segments` | `items` | codemod |
| `BulletList` with `<li>` or `Text as="li"` children | `BulletItem` children | by hand |
| `Callout`, `StatTile`, `Badge`, `Kbd`, `Code`, `Divider`, `BulletList`, `KeyValueList`, `KeyValue`, `PageFade`, `Morph`, `CopyLine` took their element's every attribute | `id`, `data-*` and `aria-*` only | by hand (any other prop is reported) |
| `PageHeaderProps`, `HeroProps`, `ListRowProps`, `DialogProps`, `DrawerProps`, `BottomSheetProps`, `LightboxProps`, `TabsProps`, `FieldDialogProps`, `ImageProps`, `MediaTileProps`, `ScrollStripProps`, `TypographyProps`, `DateFieldProps`, `DateRangePickerProps` | not exported: `ComponentProps<typeof Dialog>` | by hand |
| `ButtonLook` | not exported | by hand |

New, nothing to change: `Callout icon`; every component takes an `id` on its root; `StackRowFrom`,
`ClusterGrowMinWidth`, `TextAlign` and `TextMinWidth` are exported.

Not flagged by TypeScript: a `Callout` with no `tone` is now neutral (grey, not blue), `tone="muted"`
is one step darker than `color="muted"` was, a chart's `violet` part is now the accent, and a bare
`Text` or `Caption` is now a block `<p>`, which also must not sit inside another `<p>`, a `<span>`,
a `<button>`, an `<a>` or a `<label>`.

### The router link adapter

The app names its router's link once, on `LinkProvider`, and every part that links takes a plain
`href`. `render` is gone from `Button`, `IconButton`, `TextLink`, `Pill`, `Card`, `ListRow`,
`AppShellBrand`, a `Crumb` and a `Tabs` or `SegmentedControl` link item; `renderHome` is gone from
the status pages.

| Old | New | |
| --- | --- | --- |
| a `render` on each link | wrap the app once: TanStack Router `createRouter({ InnerWrap: ({ children }) => <LinkProvider link={(p) => <Link to="." {...p} />}>{children}</LinkProvider> })` (`to="."` satisfies the typed `to`; the `href` wins), or React Router `<LinkProvider link={({ href, ...p }) => <Link to={href} {...p} />}>` | by hand, once |
| `render={(p) => <Link to="/quotes" {...p} />}` | `href="/quotes"` | codemod |
| `to="/stores/$storeId" params={{ storeId: id }}` | ``href={`/stores/${encodeURIComponent(id)}`}`` | by hand |
| `search={{ project, env }}`, `hash="for-shops"` | `href={"/?" + new URLSearchParams({ project, env })}`, `href="/about#for-shops"` | by hand |
| `{ label, render }` crumbs and items | `{ label, href }` | codemod for a literal `to`, else by hand |
| `LinkRenderProps`, `LinkRender` | `LinkAdapterProps`, `LinkAdapter`; the props carry `href`, so an adapter spreads them and sets no `href` of its own | codemod, and reported |
| `viewTransition` on one `Link` | `defaultViewTransition` on `createRouter` | by hand |

New, nothing to change: `MediaTile` and `Avatar` take `href` and `external` beside `onClick`, and
their `onClick` is handed the click event. A `SiteSearch` result is a client-side navigation under
a `LinkProvider`. Only an in-app path (one that starts with a single `/`) reaches the adapter; an
`external` link, a full URL, a `#hash` and a relative path stay a plain `<a>`.

### The status pages' home link

Every status page but `Maintenance` links "Back to home" by itself, to the `home` on
`LinkProvider` (`/` by default). A page takes no home prop.

| Old | New | |
| --- | --- | --- |
| `<NotFound homeHref="/" />`, and the same on each page | `<NotFound />` | codemod |
| `renderHome={(p) => <a href="/" {...p} />}`, `renderHome={(p) => <Link to="/" {...p} />}` | nothing: the default, through the adapter | codemod |
| a home that is not `/` (`homeHref={SITE}`) | `<LinkProvider home={SITE}>` once, around the app or in TanStack's `InnerWrap` | by hand |

TypeScript does not flag these:

- `action` with no `homeHref` had no home link. The page now shows both, the action first, and
  there is no way to hide it.
- A `NotFound`, `ErrorPage`, `Offline` or `Forbidden` that had no `homeHref` gains "Back to home".
- `Maintenance` draws no home link, even where it had a `homeHref`.

### Buttons and pills

| Old | New | |
| --- | --- | --- |
| `Button tone="default"`, `IconButton tone="default"` | leave `tone` out: `neutral` is the default | codemod |
| `IconButton badge={3}` | `IconButton count={3}` | codemod |
| `<IconButton label="Close"><Icon name="close" /></IconButton>` | `<IconButton label="Close" icon="close" />`: `icon` is required and there are no children | codemod for an `<Icon name>` child, else by hand |
| an icon as a `Button`'s first child | `<Button icon="plus">Add a line</Button>` | by hand |
| `busy={saving} busyLabel="Saving"` | `busy={saving && "Saving"}` | codemod |
| `Pill tone="slate"` | leave `tone` out (`neutral`) | codemod |
| `Pill tone="amber"`, `"emerald"`, `"blue"`, `"red"`, `"violet"` | `"warn"`, `"positive"`, `"info"`, `"danger"`, `"accent"` | codemod |
| `Pill tone="sky"` | `tone="info"` (the blue tint) | codemod, and reported |
| `Pill label="Weight"` (the name half) | `Pill name="Weight"` | codemod |
| a tone kept in code, `const tones: PillTone[] = ["amber", "slate"]` | the new values, `["warn", "neutral"]` | codemod for a value or list typed `PillTone`, `BarTone`, `ButtonTone`, `IconButtonTone` or `CellTone`; any other `tone={…}` whose old values are gone is reported |
| any `div` attribute on `ButtonGroup` | only `id`, `data-*` and `aria-*` | by hand |

New, nothing to change: `Button` takes `ref`; `Pill` takes `size`. A `Button`, `IconButton` or
`Pill` with no `size` takes the size of the `Card`, `ListRow` or `Table` it sits in, else `md`.

TypeScript does not flag these:

- `CopyButton`'s default words are `Copy` and `Copied` (were `copy` and `copied`), so an e2e or a
  test that finds it by the name `copy` needs the capital.
- `Pill tone="sky"` drew its own sky tint; `info` is the blue one.

### Layouts and navigation

| Old | New | |
| --- | --- | --- |
| `subtitle` on `PageHeader`, `ListLayout`, `DetailLayout`, `FormLayout`, `ProseLayout`, `CenteredLayout` | `description` | codemod |
| `SidebarLayout rail`, `railLabel` | `aside`, `asideLabel` | codemod |
| `FullBleedLayout panel`, `panelLabel` | `aside`, `asideLabel` | codemod |
| `DetailLayout stickyAside` | `sticky` | codemod |
| `ListLayout isEmpty={rows.length === 0}` | nothing: `empty` shows when there are no children | codemod drops it, and reports it |
| `AppShell hideChromeInPrint` | `printChrome={false}` | codemod |
| `action` on `NotFound`, `ErrorPage`, `Offline`, `Maintenance`, `Forbidden` | `actions` | codemod |
| `FilterGroup legend` | `label` | codemod |
| `Breadcrumbs crumbs` | `items` | codemod |
| `AvatarStack people` | `items` | codemod |
| `active: true` on a `Tabs` or `SegmentedControl` link item | `selected: true` | codemod for an inline `items`, else by hand |
| `Tabs variant="pill" orientation="vertical"` | `Tabs orientation="vertical"` | codemod |
| `Tabs variant="pill"` across (and its `size`) | `Tabs`: across is always underline | codemod drops it, and reports it |
| `Container elementRef` | `ref` | codemod |
| `NavigationProgress active` | `loading`, the one name for a pending state | codemod |
| any other HTML attribute on `Avatar` or `AppShell` (`onError`, a `div` handler) | only `id`, `data-*` and `aria-*` | by hand |
| `avatarColourClass`, `initialsOf` | not exported: `Avatar` draws both from `name` | by hand |

New, nothing to change: `Breadcrumbs label` (default `Breadcrumb`), `Lightbox closeLabel`,
`previousLabel` and `nextLabel`, `MediaTile removeLabel` (default `Remove`) and
`SortableSection emptyLabel` (default `Drop here`). `SortableList`, `SortableSection` and
`SortableItem` pass every `aria-*`.

TypeScript does not flag these:

- A pill row across (`variant="pill"` in an `AppShell` `nav`, a `PageHeader` `tabs` slot or a
  section nav) is now an underline row. Only the vertical rail is pills.
- `active` on a link item in an array held in a variable (`const items = [{ ..., active: true }]`)
  still compiles, since it is not an object literal at the `Tabs`, and is ignored: rename it to
  `selected`, or no tab is marked current.
- A `ListLayout` whose children are an empty array, `null` or `false` now shows `empty` without
  `isEmpty`; one that passed `isEmpty` while it still had children now shows the children.

### EpicHeader and groupByEpic are gone

No consumer used either. There is no replacement component and no codemod swap; the codemod
reports an import of either and changes nothing.

| Removed | Write instead |
| --- | --- |
| `<EpicHeader color={c} label="HC-42 Voice Inbox" />` over a group | The group's title as `<SubsectionHeading as="h3" size="sm">` (or an `Overline` for a small label) over the group. A status beside it is a `Pill tone=… dot`. In a table, the group is a `<TableGroupRow label=… colSpan=… />`. There is no raw-colour dot. |
| `groupByEpic(items, (i) => i.epic)` | App logic, not UI: `Object.groupBy(items, (i) => i.epic ?? "")` or a `Map`, then sort the keys your way (the old order was real refs ascending, `null` last). |

### ToolCallCard is gone

No app used it. `ChatThread`, `ChatMessage` and `ChatComposer` stay.

| Removed | Write instead |
| --- | --- |
| `<ToolCallCard name="search" status="done" summary="…">…</ToolCallCard>` | A `Disclosure bordered` whose `summary` names the tool (a `Code`) and carries a `Pill` for how it went (`tone="positive"` Done, `tone="danger"` Failed, a neutral Running), with the detail as its children. |

### Running text is 1rem

Text is 1rem: an app that wants the old density sets `AppShell density="compact"` once. Nothing
else sets the step, and no component takes a type size of its own.

| | 0.10 | 0.11 | 0.11 under `AppShell density="compact"` |
| --- | --- | --- | --- |
| `Text` | 14px (`text-sm/5`) | 16px (`text-base/6`) | 14px |
| `Caption` | 12px | 14px | 12px |
| `SectionHeading` | 16px | 20px | 16px |
| `SubsectionHeading` `sm`, `md`, `lg` | 14, 16, 18px | 16, 18, 20px | 14, 16, 18px |
| `Input`, `Select`, `Textarea`, `DateField`, `Button` `sm`, `md`, `lg` | 12, 14, 16px | 14, 16, 18px | 12, 14, 16px |

TypeScript does not flag these, since no name changes:

- Every page reads one step larger unless its `AppShell` sets `density="compact"`. The codemod
  reports every `AppShell` with no `density` so a person chooses; it writes nothing.
- A text field is never under 16px on a touch screen, at any size or step, so iOS Safari does not
  zoom the page when it takes the focus.
- `Prose` now sets only its line height: `Text` inside it is 16px, as it is outside.

### Controls

Every labelled control takes the same words: `hint` for the muted line, `error` for the red one
(it marks the control invalid and replaces the hint), `disabled` and `required`, and `checked` or
`defaultChecked` with `onChange(checked)` on the two toggles.

| Old | New | |
| --- | --- | --- |
| `description` on `Checkbox`, `Switch`, `Radio`, `DateField`, `DateRangePicker` | `hint` | codemod |
| `isInvalid errorMessage="…"` on `DateField`, `DateRangePicker` | `error="…"` | codemod |
| `isInvalid` alone | `error` with the reason: the field says why | by hand |
| `errorMessage` alone, rewording the built-in message | nothing: the built-in message stands | by hand, and reported |
| `isDisabled`, `isRequired` on `RadioGroup`, `Radio`, `DateField`, `DateRangePicker` | `disabled`, `required` | codemod |
| `Checkbox onChange={(e) => f(e.target.checked)}` | `onChange={f}`: it gets the new state | codemod for that shape, else by hand |
| `Checkbox align="start"` or `align="center"` | leave it out: the box sits on the label's first line | codemod drops it |
| `ColourSchemeToggle initial` | `defaultValue` | codemod |
| `Input icon={<Icon name="search" />}` | `icon="search"` | codemod for an `<Icon name>`, else by hand |
| `<Select><option value="a">A</option></Select>` | `<Select items={[{ value: "a", label: "A" }]} />` | codemod for literal options, else by hand |
| `Select width="auto"` | nothing: `auto` is the default outside a `Field` and still right inside one | nothing to change; codemod reports a `Select` with no `width` and no `Field` round it in the file |
| `Field hideLabel` | `labelHidden` | codemod |
| `FieldDialog label="…" inputLabel="…"` | `label` alone, which names the input | codemod drops `inputLabel` |
| `FormRow action` | `actions` | codemod |

New, nothing to change: `RadioGroup hint`; `error` on `Checkbox` and `Switch`; `Switch
defaultChecked`; `Disclosure open` and `onOpenChange`; `Input clearLabel` (default `Clear search`);
`monthLabel` and `yearLabel` on a calendar `DateField` and on `DateRangePicker` (default `Month`
and `Year`); `ref` on `Input`, `Select` and `Checkbox`. `Textarea` takes `ref` as a plain prop, as
before. `RadioGroup`, `DateField` and `DateRangePicker` pass every `aria-*` and `data-*`.

TypeScript does not flag these:

- The peers are `react` and `react-dom` `>=19`.
- A `Select` with no `width` outside a `Field` is now as wide as its longest choice, not the full
  row: pass `width="full"` to keep it.
- A `Checkbox` with a one-line label sits on the line's top, where `align="center"` centred it: the
  same place for a label that fits on one line.

### Containers and rows

A container now sets what sits in it: a `Stack`'s gap, a heading's level and, in a `sm` card or
row, the size of the buttons in it. An explicit prop on the child always wins.

| Old | New | |
| --- | --- | --- |
| `Stack`, `Section` with no `gap` | the same at page level; inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow` the gap is `xs` | codemod writes `gap="md"` where there is none, so nothing moves |
| `Cluster` with no `wrap` | now wraps: `wrap={false}` keeps one line | codemod writes `wrap={false}`; drops `wrap` |
| `Cluster` with no `gap` | now `sm` (was `xs`) | codemod writes `gap="xs"` |
| `MetaList nowrap` | leave it out: an item never breaks inside itself | codemod drops it |
| `ListRow active` | `highlighted` | codemod |
| `ListRow detail` | `panel` | codemod |
| `ListRow static` | leave it out: a row with no `href` and no `onClick` is static by itself, and a button row needs `onClick` | codemod drops it |
| `Card as="section"`, `Card as="div"` | leave `as` out: a card with a `title` or an `aria-label` is a `section`, any other a `div` | codemod drops it |
| `Card dashed` whose only child is an `EmptyState` | the `EmptyState` alone: it draws its own dashed frame | codemod for a `Card` with no prop but `dashed`, else by hand |
| `Card dashed` or `dashed="filled"` round anything else | an `EmptyState` with a `title` | by hand, and reported |
| `Dialog size` | `width` | codemod |
| `Drawer size` | `width` | codemod |

New, nothing to change: `level` on `Card` and `Section`, and `EmptyState`'s now comes from where
it sits; `EmptyState icon`; `Drawer description`; `SiteSearch resultsLabel` (default `Results`).

TypeScript does not flag these:

- A `Card` title is an `h3` inside a `Section`, and an `EmptyState` title one below the heading
  that holds it, where both were always an `h2`. A test that finds one by `level: 2` needs the new
  level, or a `level` prop to pin it.
- A `Card` with neither a `title` nor an `aria-label` (or `aria-labelledby`) is a `div`, so it is
  no landmark; one with a name stays a `section`.
- A `Button`, `IconButton` or `Pill` with no `size` in a `Card size="sm"` or a `ListRow size="sm"`
  is now `sm`. The codemod reports every `Card size="sm"` and `ListRow size="sm"` so a person
  checks what is inside.
- A `ListRow` with neither `href` nor `onClick` is now a plain row with no hover fill and no button.
- A `Stack` with no `gap` inside a card, dialog, drawer, sheet, callout or row is now `xs` apart.
- A standalone `EmptyState` now draws a dashed frame round itself.

### Tables

A table is named by `label`, says a column of figures once in its head, and is plain inside a
`Card` with no prop.

| Old | New | |
| --- | --- | --- |
| `Table caption` | `label`, now required | codemod renames; reports a `Table` with none |
| `Table variant="plain"` | leave it out: a table inside a `Card` is plain | codemod drops it |
| `TableHeaderCell srLabel` | `label` | codemod |
| `TableHeaderCell align="end"` over a column of `numeric` cells | `TableHeaderCell numeric`: the title and every cell under it are end aligned in tabular figures | codemod, where the first body row's cell in that column is `numeric` |
| `TableCell numeric align="end"` | `numeric` alone: it implies `end` | codemod drops `align="end"` |
| `TableCell tone="default"` | leave it out: `neutral` is the default | codemod drops it |
| `TableCell tone="neutral"` (`text-slate-600`) | `neutral`, now `text-slate-700`, the one plain cell ink | nothing to change |

New, nothing to change: `TableRow selected` (the `ListRow` selected fill and `aria-selected`) and
`Table size` (the row padding, `sm` by default).

TypeScript does not flag these:

- A `Table` inside a `Card` that was not `plain` now draws plain: no card of its own, no head strip
  and no row hover.
- A `numeric` cell with no `align` is now end aligned. The codemod writes `align="start"` on one,
  so nothing moves until you drop it.
- A `Button`, `IconButton` or `Pill` with no `size` in a `Table` is now `sm`; a field keeps `md`. The codemod reports every `Table` so a person checks what is inside.
- A cell that was `tone="neutral"` is one step darker.

### Forms

A form's error is drawn and announced by the library, and a form inside a `Dialog` is wired by it.

New, nothing to change: `Dialog onSubmit` (one form round the body, the error and the footer, so a
`Button type="submit"` in the footer needs no `form` attribute and the body no form id) and
`Dialog error`; `FormLayout error`, directly above its `actions`.

| Old | New | |
| --- | --- | --- |
| `<FilterGroup label={x}>{chips}</FilterGroup>` | `<Fieldset label={x}><ButtonGroup>{chips}</ButtonGroup></Fieldset>` | codemod |
| `Input align="end"` | `Input numeric`: right-aligned tabular figures and `inputMode="decimal"` unless you pass your own | codemod, and drops an `inputMode="decimal"` beside it |
| `Input align="start"` | leave it out | codemod drops it |
| `Input align` with any other value | `numeric` on a field for a figure, nothing on any other | by hand, and reported |
| `ControlAlign` | no replacement | by hand, and reported |

`Fieldset` is the one labelled group: checkboxes that answer one question, a set of fields, or the
chips of one facet. It takes `hint` and `error` as a `Field` does. A `RadioGroup` is its own group
and goes in no `Fieldset`.

An amount is `<Input prefix="R" numeric />` and a count `<Input numeric inputMode="numeric" />`.
Never `type="number"` for a figure a person types.

TypeScript does not flag these:

- A `Callout tone="danger"` is `role="alert"` and a `Callout tone="warn"` is `role="status"`, so a
  test that asks for the only `alert` on a page can now find two. Find it by its text or scope it to
  a region.
- A `Fieldset` legend has the `Field` label's look, where a `FilterGroup` legend was small
  uppercase, and its chips sit 2px further apart (a `ButtonGroup`'s gap).
- A `numeric` field sets its digits in tabular figures, where `align="end"` did not.

### Layout and composition

| Old | New | |
| --- | --- | --- |
| `Text truncate`, `Caption truncate` | `lines={1}` (`lines` also clamps to 2, 3 or 4 lines) | codemod; a `truncate={expression}` is reported |
| `Overline truncate` | removed: an overline is a short label | by hand (reported) |

New, nothing to change: `Stack width="compact"` (28rem, one card's width), `Stack align="start"`
(children keep their own width), `Stack divided` (a line between rows, no gap), and the `StackAlign`
and `TextLines` types.

### Running the codemod

The codemod lives in this repository at `tools/codemod` and is not published. From a checkout of
it, after `bun install` once, point it at the app's source folder:

```bash
bun <checkout>/tools/codemod/src/run.ts src           # a dry run: lists what it would change
bun <checkout>/tools/codemod/src/run.ts src --write   # rewrites the files
```

It reads every `.ts`, `.tsx`, `.js` and `.jsx` file under the folder (not `node_modules`, `dist` or
a `.d.ts`), and changes only elements and types imported from `@hackcove/ui-react`, an aliased or
namespace import included. It edits the attributes in place and leaves the rest of the file as it
was, so run the app's formatter after it.

Each `file:line` it prints is a **by hand** row above, on a line of the rewritten file. Work through
them, then typecheck: what TypeScript still flags sits on or next to a line the codemod printed. The
lists under "TypeScript does not flag these" are what is left to check by eye.

## 0.9 → 0.10: Avatar `2xl` is 64px, the old 96px is `3xl`

`Avatar` gained a 64px size. The sizes keep their order (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`),
so the new one is `2xl` and the 96px one moved up to `3xl`. There is no alias, and **TypeScript does
not flag it**: `size="2xl"` still compiles and now draws 64px, not 96px.

1. Find every `size="2xl"` on an `Avatar` or an `AvatarStack` and write `size="3xl"`.
2. Where a 64px avatar was wanted all along (a local one drawn with `size-16`), use `size="2xl"`.

New, nothing to change: `Avatar` takes `onClick` (the whole avatar becomes one button, named by `name`);
`MediaTile` takes `aspect="natural"` and `onRemove`; `Image` takes `aspect="natural"` and `framed`
(a white mat that stays white in every theme). A theme of your own needs one rule for the mat, as
the `@hackcove/themes` files have:
`.your-scope .bg-white\/100 { background-color: #ffffff; }`.

`AppShell` renders its own `<main>`, so a page inside it must not render another; a page's root is a `<div>` or a fragment.

`ColourSchemeToggle` is named by its content now, so it is right before hydration with no script: a
test that reads its `aria-label` attribute reads the name instead (`getByRole("button", { name })`,
`toHaveAccessibleName`). The name is the same; `title` appears only after hydration.

## 0.7 → 0.8: `@hackcove/ui` is now `@hackcove/ui-react`

Nothing else changed: 0.8.0 is the 0.7.1 components under a new name, so the React package pairs
with the React Native one that comes later (`@hackcove/ui-react-native`). There is no alias package
and no re-export, so the old name stays at 0.7.1.

1. Swap the dependency: `bun remove @hackcove/ui && bun add @hackcove/ui-react`.
2. Find and replace the import specifier `"@hackcove/ui"` with `"@hackcove/ui-react"` (and any
   `@hackcove/ui/…` path with `@hackcove/ui-react/…`).
3. Change the Tailwind `@source` path to `node_modules/@hackcove/ui-react/dist`.

## 0.6 → 0.6.1: ListRow active on a panel, notices in a column, OutlineRegion

Nothing breaks; a consumer changes only what it had built for itself.

- `ListRow active` now fills the row one step deeper than hover (`bg-slate-100`), so it shows on a
  `bg-slate-50` surface such as a `FullBleedLayout` panel. A local row drawn only to get a visible
  focus is now `<ListRow size="sm" divided active={focused}>`.
- `Callout banner` is for the top of a `Card flush` only. A notice in a page's column (a
  `FullBleedLayout`, padded or not) is a plain `Callout`, first in the column's `Stack`:
  `<FullBleedLayout padded …><Stack gap="sm"><Callout tone="danger" role="alert">…</Callout>…</Stack></FullBleedLayout>`.
- New: `RegionFrame` and `OutlineRegion` mark areas of a picture. Draw the picture as
  `<RegionFrame src={…} alt={…}>` (any `<img>` prop, such as `onLoad` or `loading`, passes on) and put
  `<OutlineRegion rect={{ x, y, width, height }} within={{ width, height }} label="…" hatched />` inside
  it, in the picture's own pixels. It replaces a hand-drawn box with an arbitrary colour.

## 0.5 → 0.6: one Text role, paired parts folded

`Body` is now `Text`, and `Text strong` takes over from `BodyStrong`. `Subtitle`, `Empty` and
`ModalHeading` were near-copies of other parts and are gone with no alias: each is one of the
remaining parts with a prop. TypeScript names every use; the swaps are mechanical.

| Removed or renamed | Write instead |
| --- | --- |
| `<Body>…</Body>` | `<Text>…</Text>` (same props: `as`, `color`, `tone`, `numeric`, `mono`, `truncate`, `preserveNewlines`) |
| `<BodyStrong>…</BodyStrong>` | `<Text strong>…</Text>` |
| `<Subtitle>…</Subtitle>` | `<Text as="p">…</Text>` |
| `<Empty>…</Empty>` | `<Text as="p" color="muted">…</Text>` |
| `<ModalHeading>…</ModalHeading>` | `<SectionHeading>…</SectionHeading>` |

A block of `Text` stops at a readable line length (`max-w-[72ch]`), as `Body` did. `Subtitle` and
`BodyStrong` had no such measure, so a long line in a wide column now wraps at about 72 characters.
`PageHeader` and `Dialog` draw their own subtitle and description, and keep the full width.

The small labels of `Card`, `FilterGroup` and `StatTile` now render as an `Overline`. The `Card`
title looks the same; a `FilterGroup` legend is semibold (it was medium) and a `StatTile` label's
letter spacing is `tracking-wide` (it was `tracking-wider`).

### Paired parts folded into one (HC-169)

Each pair below was one look drawn by two exports. The survivor takes a prop, the other is gone with
no alias, and the class-string helpers are no longer exported: a router link is drawn through
`render`, never by copying a class. A swap keeps the look unless its row says otherwise.

| Removed or renamed | Write instead |
| --- | --- |
| `<ButtonLink href="/new">New</ButtonLink>` | `<Button href="/new">New</Button>` (same `variant`, `size`, `tone`, `external`) |
| `<ButtonLink render={(p) => <Link to="/new" {...p} />}>New</ButtonLink>` | `<Button render={(p) => <Link to="/new" {...p} />}>New</Button>` |
| `<DatePicker label="Due" value={d} onChange={setD} />` | `<DateField calendar label="Due" value={d} onChange={setD} />` (`defaultOpen` opens the calendar on mount) |
| `type DatePickerProps` | `type DateFieldProps` |
| `<InlineLinks>{links}</InlineLinks>` | `<MetaList nowrap>{links}</MetaList>` |
| `<InlineLinks separator="•">{links}</InlineLinks>` | `<MetaList nowrap separator="•">{links}</MetaList>` (`"none"` as before) |
| `type InlineLinksSeparator` | `type MetaListSeparator` |
| `<NavTabs label="Main" items={nav} />` | `<Tabs variant="pill" label="Main" items={nav} />` (each item `{ label, href \| render, active? }`, as before) |
| `<NavTabs orientation="vertical" label="Docs" items={nav} />` | `<Tabs variant="pill" orientation="vertical" label="Docs" items={nav} />` |
| `type NavTab` | none: let the `items` array infer, or type it as `Tab[]` only for buttons |
| `navTabClass(active)` on a router link | a link item with `render={(p) => <Link to="/x" {...p} />}` |
| `<PageTitle title="Builds" subtitle="…" />` | `<PageHeader title="Builds" subtitle="…" />` (adds `PageHeader`'s bottom margin, none as a `Stack` child) |
| `<ToggleChip pressed={on} onClick={flip}>Open</ToggleChip>` | `<Button variant="outline" size="sm" pressed={on} onClick={flip}>Open</Button>` (the chip keeps its colours, neutral off and filled on; only the corner radius changes, to a `Button`'s; `dot` has no swap, name the category in the label) |
| `buttonClass(variant, opts)` on a router link | `<Button variant={variant} render={(p) => <Link to="/x" {...p} />}>…</Button>` |
| `crumbLinkClass` on a router link | a crumb `{ label, href }` or `{ label, render }` |
| `<Link className={rowLinkClass}>` in a row's first cell | `<TextLink stretch render={(p) => <Link to="/x" {...p} />}>…</TextLink>` |
| `<Link className={linkClass}>` | `<TextLink render={(p) => <Link to="/x" {...p} />}>…</TextLink>` |
| `<Link className={cx(linkClass, linkStretchClass)}>` | `<TextLink stretch render={(p) => <Link to="/x" {...p} />}>…</TextLink>` |
| `<html className={cx(schemeClass(s), appShellRootClass)}>` | `<html className={appShellRootClassFor(s)}>` (or `appShellRootClassFor("light")` for no scheme) |

`SegmentedControl` stays. `startPageTransition` stays exported: `PageFade` pages call it.

## 0.4 → 0.5: one size scale

Every `size` is now `sm`, `md` or `lg`, and `md` is the default (README, "Sizes"). TypeScript finds
each renamed value for you; the changed defaults it cannot, so read the second table and pin the old
value where the old look was the point.

### Renamed values

| Component | Old | New |
| --- | --- | --- |
| `TextLink` | `size="xs"` | `size="sm"` |
| `TextLink` | `size="sm"` | `size="md"` |
| `SubsectionHeading` | `size="base"` | `size="md"` |
| `Stack`, `Section`, `ProseLayout` gap | `gap="section"` | `gap="xl"` |

### Changed defaults

| Component | Old default | New default | To keep the old look |
| --- | --- | --- | --- |
| `SubsectionHeading` | `sm` | `md` (`text-base/6 font-semibold`) | `size="sm"` |
| `Section` gap | `sm` (`gap-4`) | `md` (`gap-6`) | `gap="sm"` |
| `Cluster` gap | `sm` (`gap-4`) | `xs` (`gap-2`) | `gap="sm"` |
| `ProgressBar` | `sm` | `md` | `size="sm"` |
| `SplitBar`, `StackedBar` | `lg` | `md` | `size="lg"` |
| `Avatar` `md` | 28px | 32px (`size-8`) | none; `sm` is 24px |
| `IconButton`, `ColourSchemeToggle` | 36px | 38px, the `md` control height | `size="sm"` (26px) for a row |
| `NavTabs`, `Tabs variant="pill"` | 32px | 38px, the `md` control height | `size="sm"` |

### New sizes

- `lg` on `Button`, `ButtonLink`, `Input` (also `type="search"`), `Select`, `Textarea`, `Checkbox`,
  `Card`, `ListRow`, `FileDrop` and `TextLink`; `lg` on `Dialog` is 640px wide.
- A `size` prop on `RadioGroup`, `DatePicker`, `DateField`, `IconButton`, `ColourSchemeToggle`,
  `SegmentedControl`, `NavTabs` and `Tabs variant="pill"`.
- `ToggleChip` takes `size` and defaults to `sm`, its look before; `md` and `lg` match a `Button`.
- `Size` is exported; `ControlSize` is now an alias of it.
