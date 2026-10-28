import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Size } from "./size.js";

/** The corner a `badge` sits in, by `size`: inside the radius, clear of the edge. */
const BADGE_CORNER: Record<Size, string> = {
  sm: "top-2 right-2",
  md: "top-3 right-3",
  lg: "top-4 right-4",
};

/** A `Card`'s `badge`: pinned over the content; a click falls through to a link card, except on a link or button in it. */
export function CardBadge({ size, children }: { size: Size; children: ReactNode }): ReactElement {
  return (
    <span
      className={cx(
        "pointer-events-none absolute z-10 flex [&_:is(a,button)]:pointer-events-auto",
        BADGE_CORNER[size],
      )}
    >
      {children}
    </span>
  );
}
