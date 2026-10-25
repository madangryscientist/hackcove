import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
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
 * A horizontal row of items a fixed `gap` apart: the row counterpart of `Stack`. `align` is the
 * cross axis (`center` default, `baseline` for mixed text sizes, `start`, `end`) and `justify` the
 * main one (`start` default, `between` to push the first and last items to the two ends, `end`).
 * `wrap` lets the items flow onto further lines on a narrow viewport (off by default, so a row
 * stays on one line).
 *
 * Put one `ClusterGrow` around the item that takes the room left over, an input beside its
 * buttons, say. An empty `ClusterGrow` is a spacer that pushes what follows it to the end.
 * `ButtonGroup` is the row for buttons; use `Cluster` for any other row.
 */
export function Cluster({
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = false,
  children,
}: {
  gap?: ClusterGap | undefined;
  align?: ClusterAlign | undefined;
  justify?: ClusterJustify | undefined;
  wrap?: boolean | undefined;
  children?: ReactNode;
}): ReactElement {
  return (
    <div
      className={cx("flex", STACK_GAP[gap], ALIGN[align], JUSTIFY[justify], wrap && "flex-wrap")}
    >
      {children}
    </div>
  );
}

/**
 * The one child of a `Cluster` that grows to the room left in the row. It can shrink to nothing
 * (`min-w-0`), so the items beside it stay on the line and a long value truncates instead of
 * pushing them out. Empty, it is a spacer.
 */
export function ClusterGrow({ children }: { children?: ReactNode }): ReactElement {
  return <div className="min-w-0 flex-1">{children}</div>;
}
