# Migrating @hackcove/ui

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
