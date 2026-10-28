# Migrating @hackcove/ui

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
