import type { ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { navTabClass } from "./NavTabs.js";
import type { Size } from "./size.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One tab of a Tabs row. See `SwitchItem`. */
export type Tab = SwitchItem;

const BASE = `-mb-px border-b-2 px-0.5 py-2 transition ${focusRing}`;
const ON = "border-violet-600 font-medium text-violet-700";
const OFF = "border-transparent text-slate-600";
const OFF_LIVE = "hover:text-violet-700";

export type TabsProps = SwitchProps &
  (
    | {
        /** `underline` (default) is a row over a bottom rule; `pill` fills the current tab, as `NavTabs` does. */
        variant?: "underline";
        /** Only a `pill` row takes a `size`. */
        size?: undefined;
      }
    | {
        variant: "pill";
        /**
         * The pills' height and text, on the scale of a `Button`, as `NavTabs` has.
         * @default md
         */
        size?: Size;
      }
  );

/**
 * Underline tabs for switching a view in place: a row over a bottom rule, the current tab
 * underlined in the accent. `items` are `{ value, label }` buttons (`value` and `onChange` are the
 * caller's state; the arrow keys, Home and End move between tabs) or links (`href`, or `render` to
 * draw the app's own router `<Link>`; `value` marks the current one, which gets `aria-current`).
 * `variant="pill"` fills the current tab instead, with no rule, for under a `PageHeader`, and takes
 * the `size` a `NavTabs` does. An item may
 * carry a `count`, and a button one `disabled` (with a `title` for the reason); `disabled` on the
 * row disables every tab. `label` names the tab list. The panel is the caller's: give it
 * `role="tabpanel"`, and a tab `controls` to point at it.
 */
export function Tabs({ variant = "underline", size = "md", ...props }: TabsProps): ReactElement {
  const pill = variant === "pill";
  return (
    <Switcher
      {...props}
      parts={{
        group: "tablist",
        item: "tab",
        vertical: false,
        root: pill
          ? "flex flex-wrap gap-1"
          : "flex flex-wrap gap-x-5 border-b border-slate-200 text-sm",
        option: (active, disabled) =>
          pill
            ? navTabClass(active, disabled, size)
            : cx(BASE, active ? ON : OFF, !active && !disabled && OFF_LIVE),
      }}
    />
  );
}
