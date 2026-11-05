import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { STACK_GAP, type StackGap } from "./Stack.js";

/** The first three steps of `Stack`'s scale: `xs` between items in a line, `sm` inside a group, `md` between blocks. */
export type ClusterGap = Extract<StackGap, "xs" | "sm" | "md">;
export type ClusterAlign = "center" | "baseline" | "start" | "end";
export type ClusterJustify = "start" | "between" | "end";

const ALIGN: Record<ClusterAlign, string> = {
  center: "items-center",
  baseline: "items-baseline",
  start: "items-start",
  end: "items-end",
};

const JUSTIFY: Record<ClusterJustify, string> = {
  start: "justify-start",
  between: "justify-between",
  end: "justify-end",
};

/**
 * A horizontal row of items a fixed `gap` apart (`xs` by default): the row counterpart of `Stack`. `align` is the
 * cross axis (`center` default, `baseline` for mixed text sizes, `start`, `end`) and `justify` the
 * main one (`start` default, `between` to push the first and last items to the two ends, `end`).
 * `wrap` lets the items flow onto further lines on a narrow viewport (off by default, so a row
 * stays on one line).
 *
 * Put one `ClusterGrow` around the item that takes the room left over, an input beside its
 * buttons, say. An empty `ClusterGrow` is a spacer that pushes what follows it to the end.
 * `ButtonGroup` is the row for buttons; use `Cluster` for any other row. `as="span"` is for a row
 * inside phrasing content, such as a `PageHeader` subtitle (a `<p>`): its items must be phrasing
 * content too, so no `ClusterGrow`.
 */
export function Cluster({
  as: Tag = "div",
  gap = "xs",
  align = "center",
  justify = "start",
  wrap = false,
  children,
  ...rest
}: {
  /** The element. `span` for a row inside a `<p>` or other phrasing content; default `div`. */
  as?: "div" | "span" | undefined;
  /**
   * The space between items. Defaults to `xs`, not `md`, one of the library's two exceptions to the
   * `md` default: the items of a row sit closer than the blocks of a column.
   * @default xs
   */
  gap?: ClusterGap | undefined;
  /**
   * The cross axis: `center`, `baseline` (for mixed text sizes), `start` or `end`.
   * @default center
   */
  align?: ClusterAlign | undefined;
  /**
   * The main axis: `start`, `between` (the first and last items at the two ends) or `end`.
   * @default start
   */
  justify?: ClusterJustify | undefined;
  /** Let the items flow onto further lines on a narrow viewport. Off, the row stays on one line. */
  wrap?: boolean | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <Tag
      {...rest}
      className={cx("flex", STACK_GAP[gap], ALIGN[align], JUSTIFY[justify], wrap && "flex-wrap")}
    >
      {children}
    </Tag>
  );
}

export type ClusterGrowMinWidth = "sm" | "md";

/** The narrowest a `ClusterGrow` gets before it wraps under, the same two steps as `CardGrid`'s `minWidth`. */
const GROW_MIN_WIDTH: Record<ClusterGrowMinWidth, string> = {
  sm: "min-w-0 flex-[1_1_12rem]",
  md: "min-w-0 flex-[1_1_17rem]",
};

/**
 * The one child of a `Cluster` (or of a `Stack` with `rowFrom`) that grows to the room left in the
 * row. By default it can shrink to nothing (`min-w-0`), so the items beside it stay on the line and
 * a long value truncates instead of pushing them out. With `minWidth` it instead keeps that width
 * (`sm` 12rem, `md` 17rem) and, in a `Cluster` with `wrap`, drops onto the next line when the room
 * left is narrower, rather than being squashed. Empty, it is a spacer.
 */
export function ClusterGrow({
  minWidth,
  children,
  ...rest
}: {
  /** The narrowest it gets: `sm` 12rem or `md` 17rem. In a `Cluster` with `wrap` it wraps under the other items below this width. Left out, it shrinks to nothing. */
  minWidth?: ClusterGrowMinWidth | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={minWidth ? GROW_MIN_WIDTH[minWidth] : "min-w-0 flex-1"}>
      {children}
    </div>
  );
}
