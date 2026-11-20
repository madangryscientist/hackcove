import type { ReactElement } from "react";
import { cx } from "./cx.js";
import { controlText, useTypeStep } from "./density.js";
import { type ResponsiveSize, type Size, sizeClass } from "./size.js";
import { Switcher, type SwitchItem, type SwitchProps } from "./switcher.js";

/** One option of a SegmentedControl: a button with a `value`, or a link with an `href`; never both kinds in one group. */
export type Segment = SwitchItem;

// The focus ring sits inside the option, since the group's rounded edge would clip an outer one.
const RING = "focus-visible:outline-2 focus-visible:outline-violet-600";
const BASE = `border-l border-slate-300 transition first:rounded-l-full first:border-l-0 last:rounded-r-full ${RING} focus-visible:-outline-offset-2`;
/**
 * An option's padding, by `size`; its text is a control's (`controlText`). With the group's border,
 * the heights of a `Button`.
 */
const SIZE: Record<Size, string> = {
  sm: "px-2.5 py-1",
  md: "px-3 py-2",
  lg: "px-4 py-2.5",
};
/** `SIZE` from the `md` breakpoint up, for a responsive size. */
const SIZE_MD: Record<Size, string> = {
  sm: "md:px-2.5 md:py-1",
  md: "md:px-3 md:py-2",
  lg: "md:px-4 md:py-2.5",
};
/** The padding table and its `md:` twin, for the data test. */
export const segmentSizeTables = { size: SIZE, sizeMd: SIZE_MD };
const ON = "bg-violet-600 font-medium text-violet-50";
const OFF = "bg-white text-slate-600";
const OFF_LIVE = "hover:bg-violet-50 hover:text-violet-700";

/** How the group is laid out: the default inline pill, a filled pill, a wrapping box, or the box only while narrow. */
type Layout = "inline" | "fill" | "wrap" | "narrow";

const ROOT: Record<Layout, string> = {
  inline: "inline-flex rounded-full border border-slate-300",
  fill: "flex w-full rounded-full border border-slate-300",
  // The box clips each option's top and left line where it meets the group's own border.
  wrap: "flex w-full flex-wrap overflow-hidden rounded-2xl border border-slate-300",
  narrow:
    "flex w-full border border-slate-300 @min-[32rem]:rounded-full @max-[32rem]:flex-wrap @max-[32rem]:overflow-hidden @max-[32rem]:rounded-2xl",
};

/**
 * An option's own lines. In the box each option draws its top and left line one pixel up and left,
 * over its neighbour's edge, so the lines between options are one pixel and the outer ones fall
 * under the group's border. A row holds at most three (`30%` each), and they grow to fill it. The
 * box clips that pixel, so its ring sits one pixel further in.
 */
const OPTION: Record<Layout, string> = {
  inline: BASE,
  fill: cx(BASE, "flex-auto text-center"),
  wrap: cx(
    "border-slate-300 text-center transition",
    RING,
    "-mt-px -ml-px flex-[1_1_30%] border-t border-l focus-visible:-outline-offset-3",
  ),
  narrow: cx(
    "border-slate-300 text-center transition",
    RING,
    "@min-[32rem]:flex-auto @min-[32rem]:border-l @min-[32rem]:first:rounded-l-full @min-[32rem]:first:border-l-0 @min-[32rem]:last:rounded-r-full @min-[32rem]:focus-visible:-outline-offset-2",
    "@max-[32rem]:-mt-px @max-[32rem]:-ml-px @max-[32rem]:flex-[1_1_30%] @max-[32rem]:border-t @max-[32rem]:border-l @max-[32rem]:focus-visible:-outline-offset-3",
  ),
};

function layout(fill: boolean, wrap: boolean | "narrow"): Layout {
  if (wrap === "narrow") return "narrow";
  if (wrap) return "wrap";
  return fill ? "fill" : "inline";
}

/**
 * A joined pill group where one option is filled: a mode or a range chosen in place. `items` are
 * `{ value, label }` buttons (`value` and `onChange` are the caller's state; the arrow keys, Home
 * and End move the choice) or links (`href`, an in-app one drawn by the app's router `<Link>` through `LinkProvider`;
 * `value` marks the current one, which gets `aria-current`). An item may carry a `count`, and a
 * button one `disabledReason` (it stays reachable by the arrows and its reason is a tooltip) or a bare `disabled`; `disabled` on the group disables every
 * option. `label` names the group. `size` matches the height of a `Button` of the same size, and
 * `{ base, md }` changes it at 48rem.
 * `fill` stretches the options across the group's width; `wrap` lets them wrap into full rows of a
 * box, always or (`"narrow"`) only while the group is under 32rem wide.
 */
export function SegmentedControl({
  size = "md",
  fill = false,
  wrap = false,
  ...props
}: SwitchProps & {
  /**
   * The control's height and text, on the scale of a `Button`. `{ base: "md", md: "lg" }` changes
   * size at the `md` breakpoint (48rem), in CSS.
   *
   * Give it the same value as a responsive `Button` in the same row.
   * @default md
   */
  size?: Size | ResponsiveSize;
  /**
   * The group takes its parent's full width and the options grow to share it, so the border ends
   * at the last option. Still a pill.
   * @default false
   */
  fill?: boolean;
  /**
   * The options wrap onto full rows of at most three (five are 3 then 2) in a box with rounded
   * corners and a line between options, instead of a pill. `"narrow"`: the box only while the group
   * itself is under 32rem wide (a container query, so it follows the column it sits in), and a
   * filled pill from 32rem up. Implies `fill`.
   *
   * For five options that will not fit one row.
   * @default false
   */
  wrap?: boolean | "narrow";
}): ReactElement {
  const text = controlText(size, useTypeStep(), false);
  const shape = layout(fill, wrap);
  const group = (
    <Switcher
      {...props}
      parts={{
        group: "radiogroup",
        item: "radio",
        vertical: true,
        root: ROOT[shape],
        option: (active, disabled) =>
          cx(
            OPTION[shape],
            sizeClass(SIZE, SIZE_MD, size),
            text,
            active ? ON : OFF,
            !active && !disabled && OFF_LIVE,
          ),
      }}
    />
  );
  // A container query needs an element around the group; every attribute stays on the group itself.
  return shape === "narrow" ? <div className="@container w-full">{group}</div> : group;
}
