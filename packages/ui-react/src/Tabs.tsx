import type { ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { controlText, type TypeStep, useTypeStep } from "./density.js";
import type { Size } from "./size.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One tab of a Tabs row: a button with a `value`, or a link with an `href`; never both kinds in one row. */
export type Tab = SwitchItem;

const BASE = `-mb-px border-b-2 px-0.5 py-2 transition ${focusRing}`;
const ON = "border-violet-600 font-medium text-violet-700";
const OFF = "border-transparent text-slate-600";
const OFF_LIVE = "hover:text-violet-700";

// A transparent border, so a pill is as tall as a `Button` of the same size.
const PILL = `rounded-lg border border-transparent transition ${focusRing}`;

/** A pill's padding, by `size`; its text is a control's (`controlText`), so it lines up with a `Button`. */
const PILL_SIZE: Record<Size, string> = {
  sm: "px-2.5 py-1",
  md: "px-3 py-2",
  lg: "px-4 py-2.5",
};

/** The classes of one pill tab at the type `step` in force. A `disabled` one drops the hover fill. */
export function pillTabClass(
  active: boolean,
  disabled = false,
  size: Size = "md",
  step?: TypeStep,
): string {
  return cx(
    PILL,
    PILL_SIZE[size],
    controlText(size, step, false),
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600",
    !active && !disabled && "hover:bg-slate-100",
  );
}

export type TabsProps = SwitchProps &
  (
    | {
        /**
         * `horizontal` is a row of underline tabs over a bottom rule; `vertical` is the pill rail, a
         * column at the rail's width for a `SidebarLayout` aside, where the up and down arrows move
         * between button tabs.
         * @default horizontal
         */
        orientation?: "horizontal";
        /** Only the vertical rail takes a `size`. */
        size?: undefined;
      }
    | {
        orientation: "vertical";
        /**
         * The pills' height and text, on the scale of a `Button`.
         * @default md
         */
        size?: Size;
      }
  );

/**
 * Tabs for switching a view in place or between pages. Across (the default) they are underline
 * tabs: a row over a bottom rule, the current tab underlined in the accent. `orientation="vertical"`
 * is the pill rail instead, the current tab filled, for a `SidebarLayout` aside, and takes a
 * `size`. `items` are `{ value, label }` buttons (`value` and `onChange` are the caller's state;
 * the arrow keys, Home and End move between tabs) or links (`href`, an in-app one through
 * `LinkProvider`; `selected` on an item, or `value`, marks the current one, which gets
 * `aria-current`). An item may carry a `count`, and a button one `disabledReason` (it stays
 * reachable by the arrows and its reason is a tooltip) or a bare `disabled`; `disabled` on the row disables every tab. `label` names the tab list. The panel is
 * the caller's: give it `role="tabpanel"`, and a tab `controls` to point at it.
 */
export function Tabs({
  size = "md",
  orientation = "horizontal",
  ...props
}: TabsProps): ReactElement {
  const stacked = orientation === "vertical";
  const step = useTypeStep();
  return (
    <Switcher
      {...props}
      parts={{
        group: "tablist",
        item: "tab",
        vertical: stacked,
        stacked,
        root: stacked ? "flex flex-col gap-1" : UNDERLINE_ROW,
        option: (active, disabled) =>
          stacked
            ? pillTabClass(active, disabled, size, step)
            : cx(BASE, active ? ON : OFF, !active && !disabled && OFF_LIVE),
      }}
    />
  );
}

const UNDERLINE_ROW = "flex flex-wrap gap-x-5 border-b border-slate-200 text-sm";
