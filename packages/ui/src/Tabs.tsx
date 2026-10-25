import type { ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One tab of a Tabs row. See `SwitchItem`. */
export type Tab = SwitchItem;

const BASE = `-mb-px border-b-2 px-0.5 py-2 transition ${focusRing}`;
const ON = "border-violet-600 font-medium text-violet-700";
const OFF = "border-transparent text-slate-600 hover:text-violet-700";

/**
 * Underline tabs for switching a view in place: a row over a bottom rule, the current tab
 * underlined in the accent. `items` are `{ value, label }` buttons (`value` and `onChange` are the
 * caller's state; the arrow keys, Home and End move between tabs) or links (`href`, or `render` to
 * draw the app's own router `<Link>`; `value` marks the current one, which gets `aria-current`).
 * `label` names the tab list. The panel is the caller's: give it `role="tabpanel"`, and a tab
 * `controls` to point at it.
 */
export function Tabs(props: SwitchProps): ReactElement {
  return (
    <Switcher
      {...props}
      parts={{
        group: "tablist",
        item: "tab",
        vertical: false,
        root: "flex flex-wrap gap-x-5 border-b border-slate-200 text-sm",
        option: (active) => cx(BASE, active ? ON : OFF),
      }}
    />
  );
}
