/**
 * The one size scale of the library: `sm`, `md` (the default everywhere) and `lg`. A component
 * extends it outward only where it has a real use (Avatar's `xl` and `2xl`, the gap scale's `xs`
 * and `xl`), and no scale skips `md`.
 */
export type Size = "sm" | "md" | "lg";
