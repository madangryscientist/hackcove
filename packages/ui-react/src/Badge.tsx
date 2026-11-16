import type { ReactElement } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { type LoadingProps, useLoading, WaitingBone } from "./skeleton.js";

/**
 * A small red count, 10px, for sitting on an icon. `corner` pins it to the top-right corner of its
 * `relative` parent (wrap the icon button and the badge in a `relative inline-flex` element); a
 * count above 99 reads `99+`. Name the control it sits on (`aria-label` on the button) for a
 * screen reader. An `IconButton` takes `count` itself and does all of this. While `loading` it is
 * a bone of its size: a count is a number, so 0 is a value and not a gap.
 */
export function Badge({
  count,
  corner = false,
  loading: ownLoading,
  loadingLabel,
  ...rest
}: {
  /** The number shown; above 99 it reads `99+`. */
  count: number;
  /** Pin it to the top-right corner of its `relative` parent, over the icon. */
  corner?: boolean;
} & LoadingProps &
  Passthrough): ReactElement {
  if (useLoading(ownLoading).loading) {
    return (
      <WaitingBone
        own={ownLoading}
        label={loadingLabel}
        attrs={rest}
        root={cx("inline-flex", corner && "absolute -right-1.5 -top-1.5")}
        shape="inline-block h-4 w-5 rounded-full"
      />
    );
  }
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
