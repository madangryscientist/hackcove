import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

const BASE = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${focusRing}`;
const OFF = "border-slate-200 bg-white text-slate-600 hover:border-violet-400";
const ON = "border-violet-600 bg-violet-600 text-violet-50";

/** An on/off pill button for filters. `pressed` sets its state; `dot` adds a leading colour dot. The caller toggles it in onClick. */
export function ToggleChip({
  pressed,
  dot,
  className,
  children,
  ...rest
}: {
  pressed: boolean;
  /** A CSS colour for a leading dot (e.g. a category colour); no dot when omitted. */
  dot?: string;
} & ComponentPropsWithoutRef<"button">): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx(BASE, pressed ? ON : OFF, className)}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </button>
  );
}
