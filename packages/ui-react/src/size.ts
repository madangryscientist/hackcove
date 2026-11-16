/**
 * The one size scale of the library: `sm`, `md` and `lg`, with `md` the default. This is the one
 * list of where it goes further and where the default is not `md`; the README and the docs point
 * here rather than count them again.
 *
 * Past `sm`, `md` and `lg`, only where there is a real use, and no scale skips `md`:
 * - `Avatar` and `AvatarStack` `size`: also `xs`, `xl`, `2xl` and `3xl`.
 * - The gap scale (`Stack`, `Section` and `ProseLayout` `gap`): also `xs` and `xl`.
 * - `Cluster` and `ScrollStrip` `gap`: `xs`, `sm` and `md`, the first steps of the gap scale.
 * - `Icon` `size`: also `feature`, the mark of a feature card.
 * - `Dialog` `width`: also `full`, the whole screen. `ChatThread` `height`: also `fill`, its parent's.
 *
 * Defaults that are not `md`:
 * - `Table` `size` is `sm`, its row padding, and the buttons and pills in a table take that size;
 *   a field keeps `md`.
 * - `Cluster` and `ScrollStrip` `gap` are `sm`: the items of a row sit closer than the blocks of a
 *   column.
 * - `Stack` and `Section` `gap` are `xs` inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`,
 *   `Callout` or `ListRow`.
 * - A `Pill`, `Button` or `IconButton` with no `size` takes the size of the `Card`, `ListRow` or
 *   `Table` it sits in; an `EmptyState` takes its slot's.
 *
 * With no `size` at all, because they take the size of the text or the control they sit on:
 * `Callout`, `CopyButton`, `Kbd`, `Badge` and `Breadcrumbs`.
 */
export type Size = "sm" | "md" | "lg";
