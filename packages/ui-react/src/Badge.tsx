import type { ReactElement } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { type LoadingProps, useLoading, WaitingBone } from "./skeleton.js";

/**
 * A small red count, 10px, for sitting on an icon. An icon with a count is an `IconButton` with
 * its `count`, which pins the Badge to its corner and puts the count in the button's name. A
 * count above 99 reads `99+`. While `loading` it is
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
  /** Pin it to the top corner at the end edge of its `relative` parent, over the icon. */
  corner?: boolean;
} & LoadingProps &
  Passthrough): ReactElement {
  if (useLoading(ownLoading).loading) {
    return (
      <WaitingBone
        own={ownLoading}
        label={loadingLabel}
        attrs={rest}
        root={cx("inline-flex", corner && "absolute -end-1.5 -top-1.5")}
        shape="inline-block h-4 w-5 rounded-full"
      />
    );
  }
  return (
    <span
      {...rest}
      className={cx(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-red-50",
        corner && "absolute -end-1.5 -top-1.5",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
