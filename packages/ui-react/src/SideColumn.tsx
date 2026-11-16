import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { FoldedColumn } from "./foldedColumn.js";
import type { Passthrough } from "./props.js";
import { useScrollEdges } from "./scrollEdges.js";
import { scrollStopProps, useScrollStop } from "./scrollStop.js";
import { STICKY_ASIDE_LG, STICKY_FADE_LG, STICKY_SCROLL_LG } from "./stickyColumn.js";

/** How wide a `SideColumn`'s aside is from `lg`: `sm` 18rem, `md` 24rem, or `third` a third of the row. */
export type SideColumnWidth = "sm" | "md" | "third";

/**
 * The grid from `lg`, and the main area's share of it: `sm` and `md` give the aside exactly that
 * width and the main area the room left; `third` gives the aside one third and the main area two.
 */
const COLUMNS: Record<SideColumnWidth, { grid: string; main: string }> = {
  sm: { grid: "lg:grid-cols-[minmax(0,1fr)_18rem]", main: "" },
  md: { grid: "lg:grid-cols-[minmax(0,1fr)_24rem]", main: "" },
  third: { grid: "lg:grid-cols-3", main: "lg:col-span-2" },
};

/**
 * A main area beside a side column, in the Container the page already has: from `lg` the `aside`
 * is `asideWidth` on the right and `children` take the room left; below `lg` the aside stacks under
 * `children`. It sets no page width, padding or header of its own, so it sits inside a layout, a
 * `Card` or a panel. `asideWidth` is `sm` (18rem), `md` (24rem) or `third` (one third of the row,
 * the main area two thirds: the split `DetailLayout` draws). A rail of links on the left is
 * `SidebarLayout`.
 *
 * `asideLabel` is for an aside that should not take the phone's screen: below `lg` it folds,
 * closed, behind a native disclosure of that name, and from `lg` it is the same column, always
 * shown. The aside stays mounted while folded, so a conversation or a draft inside it is kept.
 *
 * `sticky` keeps the aside in view from `lg` as a long page scrolls: it sticks under AppShell's
 * header and, if it is taller than the room left, scrolls itself (a tab stop named by `asideLabel`)
 * so its end stays reachable.
 */
export function SideColumn({
  asideLabel,
  ...props
}: {
  /** The side column: `asideWidth` wide on the right from `lg`, under `children` below it. */
  aside: ReactNode;
  /**
   * The aside's width from `lg`: `sm` 18rem, `md` 24rem, or `third`, one third of the row.
   * @default md
   */
  asideWidth?: SideColumnWidth | undefined;
  /** Folds the aside behind a disclosure with this name below `lg`, and names the `<aside>` landmark. Left out, the aside is always shown and unnamed. */
  asideLabel?: string | undefined;
  /**
   * From `lg`, keeps the aside in view under the header as the page scrolls; an aside taller than
   * the screen scrolls inside itself.
   * @default false
   */
  sticky?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return <SplitColumns {...props} label={asideLabel} fold={asideLabel !== undefined} />;
}

/**
 * The one two-column split: `SideColumn`, and `DetailLayout`'s columns, whose `asideLabel` names
 * the aside without folding it. Internal.
 */
export function SplitColumns({
  aside,
  asideWidth = "md",
  label,
  fold,
  sticky = false,
  children,
  ...rest
}: {
  aside: ReactNode;
  asideWidth?: SideColumnWidth | undefined;
  label: string | undefined;
  fold: boolean;
  sticky?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const { element, attach, stop } = useScrollStop();
  useScrollEdges(element, "y");
  const { props, ring } = scrollStopProps(sticky && stop, { label });
  const columns = COLUMNS[asideWidth];
  return (
    <div {...rest} className={cx("grid grid-cols-1 gap-6", columns.grid)}>
      <div className={cx("min-w-0", columns.main)}>{children}</div>
      <aside className={cx("min-w-0", sticky && STICKY_ASIDE_LG)} aria-label={label}>
        <div
          ref={sticky ? attach : undefined}
          {...props}
          className={sticky ? cx(STICKY_SCROLL_LG, STICKY_FADE_LG, ring) : undefined}
        >
          {fold && label !== undefined ? (
            <FoldedColumn from="lg" label={label}>
              {aside}
            </FoldedColumn>
          ) : (
            aside
          )}
        </div>
      </aside>
    </div>
  );
}
