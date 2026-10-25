import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { ControlSize } from "./control.js";
import { cx, focusRing } from "./cx.js";

/**
 * A native checkbox with its label. `className` goes on the label, every other prop on the input.
 * `size="sm"` is `text-xs` and a smaller box, for a dense row. Leave `label` out for a bare box in
 * a table cell, and name it with `aria-label`.
 */
export function Checkbox({
  label,
  size = "md",
  className,
  ...rest
}: {
  label?: ReactNode;
  size?: ControlSize | undefined;
} & Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width">): ReactElement {
  const small = size === "sm";
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center text-slate-700",
        small ? "gap-1.5 text-xs" : "gap-2 text-sm",
        className,
      )}
    >
      <input
        type="checkbox"
        className={cx(small ? "h-3.5 w-3.5" : "h-4 w-4", "accent-violet-600", focusRing)}
        {...rest}
      />
      {label}
    </label>
  );
}
