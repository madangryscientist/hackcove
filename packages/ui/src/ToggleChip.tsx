import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

const BASE = `inline-flex items-center rounded-full border font-medium transition ${focusRing}`;

/** The chip's padding and text, by `size`: the heights of a `Button`. */
const SIZE: Record<Size, string> = {
  sm: "gap-1.5 px-2.5 py-1 text-xs",
  md: "gap-2 px-3 py-2 text-sm",
  lg: "gap-2 px-4 py-2.5 text-base",
};
const OFF = "border-slate-200 bg-white text-slate-600 hover:border-violet-400";
const ON = "border-violet-600 bg-violet-600 text-violet-50";

/**
 * An on/off pill button for filters. `pressed` sets its state; `dot` adds a leading colour dot. The
 * caller toggles it in onClick. `size` is on the scale of a `Button`, but defaults to `sm`, one of
 * the library's two exceptions to the `md` default: a row of filter chips is dense.
 */
export function ToggleChip({
  pressed,
  dot,
  size = "sm",
  children,
  ...rest
}: {
  /** On or off: a pressed chip is filled, and its `aria-pressed` says so. */
  pressed: boolean;
  /** A CSS colour for a leading dot (e.g. a category colour); no dot when omitted. */
  dot?: string;
  /**
   * The chip's height and text, on the scale of a `Button`. Defaults to `sm`, not `md`: a row of
   * filter chips is dense.
   * @default sm
   */
  size?: Size;
} & Unstyled<ComponentPropsWithoutRef<"button">>): ReactElement {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={pressed}
      className={cx(BASE, SIZE[size], pressed ? ON : OFF)}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cx("h-1.5 w-1.5 rounded-full", pressed && "ring-1 ring-current")}
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </button>
  );
}
