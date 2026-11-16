import type { ReactElement } from "react";
import { cx } from "./cx.js";
import { controlText, useTypeStep } from "./density.js";
import type { Size } from "./size.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One option of a SegmentedControl. See `SwitchItem`. */
export type Segment = SwitchItem;

// The focus ring sits inside the option, since the group's rounded edge would clip an outer one.
const BASE =
  "border-l border-slate-300 transition first:rounded-l-full first:border-l-0 last:rounded-r-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600";
/**
 * An option's padding, by `size`; its text is a control's (`controlText`). With the group's border,
 * the heights of a `Button`.
 */
const SIZE: Record<Size, string> = {
  sm: "px-2.5 py-1",
  md: "px-3 py-2",
  lg: "px-4 py-2.5",
};
const ON = "bg-violet-600 font-medium text-violet-50";
const OFF = "bg-white text-slate-600";
const OFF_LIVE = "hover:bg-violet-50 hover:text-violet-700";

/**
 * A joined pill group where one option is filled: a mode or a range chosen in place. `items` are
 * `{ value, label }` buttons (`value` and `onChange` are the caller's state; the arrow keys, Home
 * and End move the choice) or links (`href`, an in-app one drawn by the app's router `<Link>` through `LinkProvider`;
 * `value` marks the current one, which gets `aria-current`). An item may carry a `count`, and a
 * button one `disabled` (with a `title` for the reason); `disabled` on the group disables every
 * option. `label` names the group. `size` matches the height of a `Button` of the same size.
 */
export function SegmentedControl({
  size = "md",
  ...props
}: SwitchProps & {
  /**
   * The control's height and text, on the scale of a `Button`.
   * @default md
   */
  size?: Size;
}): ReactElement {
  const text = controlText(size, useTypeStep(), false);
  return (
    <Switcher
      {...props}
      parts={{
        group: "radiogroup",
        item: "radio",
        vertical: true,
        root: "inline-flex rounded-full border border-slate-300",
        option: (active, disabled) =>
          cx(BASE, SIZE[size], text, active ? ON : OFF, !active && !disabled && OFF_LIVE),
      }}
    />
  );
}
