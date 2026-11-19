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
 * A responsive size, `{ base, md }` (`ResponsiveSize`), changes at Tailwind's `md` breakpoint (48rem)
 * in CSS, with no script: `Button`, `IconButton`, `SegmentedControl` and `Icon` take it.
 *
 * With no `size` at all, because they take the size of the text or the control they sit on:
 * `Callout`, `CopyButton`, `Kbd`, `Badge` and `Breadcrumbs`.
 */
export type Size = "sm" | "md" | "lg";

/**
 * A size that changes with the screen: `base` at every width, `md` from Tailwind's `md` breakpoint
 * (48rem) up. Done in CSS, so a server-rendered page paints the right size on its first load.
 */
export type ResponsiveSize = { base: Size; md: Size };

/** Whether `size` is the responsive form. */
export function isResponsive(size: string | ResponsiveSize): size is ResponsiveSize {
  return typeof size === "object";
}

/**
 * The classes of `size` from a table and its twin, the same classes each prefixed `md:` and written
 * out in full (a consumer's Tailwind scans the built package, so a class built at run time would
 * never be generated). A plain size is its table entry, unchanged.
 */
export function sizeClass<K extends string>(
  table: Record<K, string> & Record<Size, string>,
  twin: Record<Size, string>,
  size: K | ResponsiveSize,
): string {
  return isResponsive(size) ? `${table[size.base]} ${twin[size.md]}` : table[size];
}
