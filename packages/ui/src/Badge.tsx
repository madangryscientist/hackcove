import type { HTMLAttributes } from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/**
 * A small red count, 10px, for sitting on an icon. `corner` pins it to the top-right corner of its
 * `relative` parent (wrap the icon button and the badge in a `relative inline-flex` element); a
 * count above 99 reads `99+`. Name the control it sits on (`aria-label` on the button) for a
 * screen reader.
 */
export function Badge({
  count,
  corner = false,
  ...rest
}: {
  count: number;
  corner?: boolean;
} & Unstyled<Omit<HTMLAttributes<HTMLSpanElement>, "children">>) {
  return (
    <span
      {...rest}
      className={cx(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-red-50",
        corner && "absolute -right-1.5 -top-1.5",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
