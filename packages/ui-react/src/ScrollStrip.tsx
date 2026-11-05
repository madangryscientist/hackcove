import type { ReactElement, ReactNode } from "react";
import type { ClusterGap } from "./Cluster.js";
import { cx, focusRing, themedScrollbar } from "./cx.js";
import type { Passthrough } from "./props.js";
import { STACK_GAP } from "./Stack.js";

export type ScrollStripProps = {
  /** Names the strip for a screen reader, e.g. "Recent statuses". */
  label: string;
  /** The items, one after another: `MediaTile`s, `Avatar`s. They keep their own width. */
  children: ReactNode;
  /**
   * The space between items, as `Cluster`'s `gap`.
   * @default sm
   */
  gap?: ClusterGap | undefined;
} & Passthrough;

/**
 * A single row of items that scrolls sideways when it runs past the width of its parent, with a
 * thin themed scrollbar and the items snapping into place: a strip of `MediaTile`s or `Avatar`s.
 * Items never shrink or wrap. The strip takes the keyboard focus, so the arrow keys scroll it
 * without a pointer. A grid that wraps is a `CardGrid` or a `Cluster`.
 */
export function ScrollStrip({
  label,
  children,
  gap = "sm",
  ...rest
}: ScrollStripProps): ReactElement {
  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      tabIndex={0}
      className={cx(
        "overflow-x-auto rounded-lg pb-2 [scroll-snap-type:x_proximity]",
        themedScrollbar,
        focusRing,
      )}
    >
      <div
        className={cx(
          "flex w-max min-w-full text-slate-900 *:shrink-0 *:snap-start",
          STACK_GAP[gap],
        )}
      >
        {children}
      </div>
    </div>
  );
}
