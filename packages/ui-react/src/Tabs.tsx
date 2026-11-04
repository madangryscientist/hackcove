import type { ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import type { Size } from "./size.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One tab of a Tabs row. See `SwitchItem`. */
export type Tab = SwitchItem;

const BASE = `-mb-px border-b-2 px-0.5 py-2 transition ${focusRing}`;
const ON = "border-violet-600 font-medium text-violet-700";
const OFF = "border-transparent text-slate-600";
const OFF_LIVE = "hover:text-violet-700";

// A transparent border, so a pill is as tall as a `Button` of the same size.
const PILL = `rounded-lg border border-transparent transition ${focusRing}`;

/** A pill's padding and text, by `size`. */
const PILL_SIZE: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

/** The classes of one pill tab. A `disabled` one drops the hover fill. */
export function pillTabClass(active: boolean, disabled = false, size: Size = "md"): string {
  return cx(
    PILL,
    PILL_SIZE[size],
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600",
    !active && !disabled && "hover:bg-slate-100",
  );
}

export type TabsProps = SwitchProps &
  (
    | {
        /** `underline` (default) is a row over a bottom rule; `pill` fills the current tab. */
        variant?: "underline";
        /** Only a `pill` row takes a `size`. */
        size?: undefined;
        /** Only a `pill` row takes an `orientation`. */
        orientation?: undefined;
      }
    | {
        variant: "pill";
        /**
         * The pills' height and text, on the scale of a `Button`.
         * @default md
         */
        size?: Size;
        /**
         * `vertical` stacks the pills in one column at the rail's width, for a `SidebarLayout` rail;
         * the up and down arrows then move between button tabs.
         * @default horizontal
         */
        orientation?: "horizontal" | "vertical";
      }
  );

/**
 * Underline tabs for switching a view in place: a row over a bottom rule, the current tab
 * underlined in the accent. `items` are `{ value, label }` buttons (`value` and `onChange` are the
 * caller's state; the arrow keys, Home and End move between tabs) or links (`href`, or `render` to
 * draw the app's own router `<Link>`; `active` on an item, or `value`, marks the current one, which
 * gets `aria-current`). `variant="pill"` fills the current tab instead, with no rule, for under a
 * `PageHeader` or as a site's section nav, and takes a `size`; `orientation="vertical"` stacks the
 * pills for a `SidebarLayout` rail. An item may carry a `count`, and a button one `disabled` (with a
 * `title` for the reason); `disabled` on the row disables every tab. `label` names the tab list.
 * The panel is the caller's: give it `role="tabpanel"`, and a tab `controls` to point at it.
 */
export function Tabs({
  variant = "underline",
  size = "md",
  orientation = "horizontal",
  ...props
}: TabsProps): ReactElement {
  const pill = variant === "pill";
  const stacked = pill && orientation === "vertical";
  return (
    <Switcher
      {...props}
      parts={{
        group: "tablist",
        item: "tab",
        vertical: stacked,
        stacked,
        root: rootClass(pill, stacked),
        option: (active, disabled) =>
          pill
            ? pillTabClass(active, disabled, size)
            : cx(BASE, active ? ON : OFF, !active && !disabled && OFF_LIVE),
      }}
    />
  );
}

function rootClass(pill: boolean, stacked: boolean): string {
  if (stacked) return "flex flex-col gap-1";
  return pill ? "flex flex-wrap gap-1" : "flex flex-wrap gap-x-5 border-b border-slate-200 text-sm";
}
