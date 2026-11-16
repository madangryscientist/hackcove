/**
 * The one tone vocabulary of the library: what a thing means, not what colour it is. `neutral`
 * (no meaning, the role's own ink or surface) is every component's default, `info` is a note,
 * `positive` a success, `warn` a caution and `danger` an error or a destructive act.
 *
 * A component extends it outward only where it has a real use, and says so beside its own type:
 * the text roles add `muted` (a quieter line) and `accent` (the theme's accent ink), `Pill` and the
 * charts add `accent` for a category that is none of the five meanings. No component renames a
 * tone (`negative`, `default`, `slate` and the colour names are gone), and no scale skips `neutral`.
 */
export type Tone = "neutral" | "info" | "positive" | "warn" | "danger";
