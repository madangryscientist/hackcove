/* The tooltip wiring of a removable plain pill. Internal to `Pill`. */

/** The keys the tooltip owns on its trigger, with the tab stop it needs. */
const TIP_KEYS = new Set([
  "title",
  "aria-describedby",
  "style",
  "tabIndex",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerDown",
  "onFocus",
  "onBlur",
  "onKeyDown",
]);

/**
 * A removable plain pill's attributes, split: the tooltip's wiring goes on its text, so the x's own
 * focus and hover never reach it, and the rest stays on the shell, once.
 */
export function splitTip(attrs: Record<string, unknown>): {
  wiring: Record<string, unknown>;
  rest: Record<string, unknown>;
} {
  const entries = Object.entries(attrs);
  return {
    wiring: Object.fromEntries(entries.filter(([key]) => TIP_KEYS.has(key))),
    rest: Object.fromEntries(entries.filter(([key]) => !TIP_KEYS.has(key))),
  };
}
