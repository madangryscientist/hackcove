import type { ReactNode, SyntheticEvent } from "react";
import { type TriggerOwn, type TriggerProps, useTooltip } from "./Tooltip.js";

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

type Blocked = { "aria-disabled"?: true; onClick?: (event: SyntheticEvent) => void };

/**
 * `disabledReason` on one control, the same on every part that takes it: with a reason the control
 * is blocked (`blockedProps`) and the reason is its tooltip, shown on hover, keyboard focus and a
 * tap, and read out as its description; with none, `props` is the tooltip-free `own`. Spread `props`
 * last on the control and render `tooltip` after it, outside any `<label>` (whose text would
 * otherwise join the control's name). Internal.
 */
export function useBlocked<E extends Element>(
  reason: string | undefined,
  own: TriggerOwn<E>,
): { props: TriggerProps<E> & Blocked; tooltip: ReactNode; blocked: boolean } {
  const { props, tooltip } = useTooltip(reason, { describes: true, tap: true }, own);
  const blocked = reason !== undefined;
  return { props: blocked ? { ...props, ...blockedProps() } : props, tooltip, blocked };
}
