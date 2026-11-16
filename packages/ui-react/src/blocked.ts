import type { SyntheticEvent } from "react";

/** Swallows an activation: no handler runs, and a `type="submit"` button submits nothing. */
function swallow(event: SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * The blocked state of a control that says why it cannot be used (`disabledReason`): marked
 * `aria-disabled` rather than `disabled`, so it stays in the tab order and the keyboard reaches its
 * reason, and its click is swallowed (Enter and Space on a button arrive as a click). Spread it
 * last on the control, over the caller's own `onClick`. Internal.
 */
export function blockedProps(): {
  "aria-disabled": true;
  onClick: (event: SyntheticEvent) => void;
} {
  return { "aria-disabled": true, onClick: swallow };
}
