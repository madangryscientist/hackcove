import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { FoldedColumn } from "./foldedColumn.js";
import type { Passthrough } from "./props.js";

export type SideColumnWidth = "sm" | "md";

/** The grid from `lg`: the main area takes the room left, the aside is exactly this wide. */
const COLUMNS: Record<SideColumnWidth, string> = {
  sm: "lg:grid-cols-[minmax(0,1fr)_18rem]",
  md: "lg:grid-cols-[minmax(0,1fr)_24rem]",
};

/**
 * A main area beside a side column of a fixed width, in the Container the page already has: from
 * `lg` the `aside` is `asideWidth` wide on the right and `children` take the room left; below `lg`
 * the aside stacks under `children`. It sets no page width, padding or header of its own, so it
 * sits inside a layout, a `Card` or a panel. A side column that is a share of the page and sits
 * under a page header is `DetailLayout`'s aside; a rail of links on the left is `SidebarLayout`.
 *
 * `asideLabel` is for an aside that should not take the phone's screen: below `lg` it folds,
 * closed, behind a native disclosure of that name, and from `lg` it is the same column, always
 * shown. The aside stays mounted while folded, so a conversation or a draft inside it is kept.
 */
export function SideColumn({
  aside,
  asideWidth = "md",
  asideLabel,
  children,
  ...rest
}: {
  /** The side column: `asideWidth` wide on the right from `lg`, under `children` below it. */
  aside: ReactNode;
  /**
   * The aside's width from `lg`: `sm` 18rem or `md` 24rem.
   * @default md
   */
  asideWidth?: SideColumnWidth | undefined;
  /** Folds the aside behind a disclosure with this name below `lg`. Left out, the aside is always shown. */
  asideLabel?: string | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={cx("grid grid-cols-1 gap-6", COLUMNS[asideWidth])}>
      <div className="min-w-0">{children}</div>
      <aside className="min-w-0">
        {asideLabel === undefined ? (
          aside
        ) : (
          <FoldedColumn from="lg" label={asideLabel}>
            {aside}
          </FoldedColumn>
        )}
      </aside>
    </div>
  );
}
