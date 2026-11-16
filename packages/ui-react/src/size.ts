/**
 * The one size scale of the library: `sm`, `md` and `lg`. A component extends it outward only where
 * it has a real use (Avatar's `xs`, `xl` and `2xl`, the gap scale's `xs` and `xl`), and no scale
 * skips `md`.
 *
 * `md` is the default of every `size` prop but one: `Table`'s, its row padding, is `sm`, and the
 * buttons and pills in a table take that size; a field keeps `md`. The closed list of components
 * with no `size` at all, because they take the size of the text or the control they sit on:
 * `Callout`, `CopyButton`, `Kbd`, `Badge` and `Breadcrumbs`.
 */
export type Size = "sm" | "md" | "lg";
