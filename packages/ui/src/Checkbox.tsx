import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";

/** A native checkbox with its label. `className` goes on the label; every other prop goes on the input. */
export function Checkbox({
  label,
  className,
  ...rest
}: { label: ReactNode } & Omit<ComponentPropsWithoutRef<"input">, "type">): ReactElement {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700",
        className,
      )}
    >
      <input type="checkbox" className={cx("h-4 w-4 accent-violet-600", focusRing)} {...rest} />
      {label}
    </label>
  );
}
