import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { ControlSize } from "./control.js";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

/**
 * A native checkbox with its label. Every prop but the label goes on the input.
 * `size="sm"` is `text-xs` and a smaller box, for a dense row. Leave `label` out for a bare box in
 * a table cell, and name it with `aria-label`. `align="start"` puts the box on the label's first
 * line, for a label that wraps onto several; the default centres it on the whole label. The box
 * keeps its size either way.
 */
export function Checkbox({
  label,
  size = "md",
  align = "center",
  ...rest
}: {
  label?: ReactNode;
  size?: ControlSize | undefined;
  align?: "center" | "start" | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width">>): ReactElement {
  const small = size === "sm";
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer text-slate-700",
        align === "start" ? "items-start" : "items-center",
        small ? "gap-1.5 text-xs" : "gap-2 text-sm",
      )}
    >
      <input
        type="checkbox"
        className={cx(
          small ? "h-3.5 w-3.5" : "h-4 w-4",
          "shrink-0",
          align === "start" && (small ? "mt-px" : "mt-0.5"),
          "accent-violet-600",
          focusRing,
        )}
        {...rest}
      />
      {label}
    </label>
  );
}
