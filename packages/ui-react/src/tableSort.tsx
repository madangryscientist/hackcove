import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import type { Align } from "./tableRow.js";

/** Where a sortable column stands: ARIA's own words. `none` is a column the table is not sorted by. */
export type TableSort = "ascending" | "descending" | "none";

/** The props of a sortable `TableHeaderCell`: the column's `sort` and what a click asks for. */
export type SortProps = {
  /**
   * Where this column stands: `ascending`, `descending`, or `none` when the table is sorted by
   * another column. The app sorts its rows and passes it back; one sorted column at a time.
   */
  sort: TableSort;
  /** Called with the next direction on a click: `none` goes to `ascending`, then each click flips it. */
  onSort: (next: "ascending" | "descending") => void;
};

/** The direction a click asks for: `ascending` first, then it flips. */
function nextSort(sort: TableSort): "ascending" | "descending" {
  return sort === "ascending" ? "descending" : "ascending";
}

const JUSTIFY: Record<Align, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

/** The arrow beside a sortable title: up, down, or both, faint, on a column not sorted by. */
function SortArrow({ sort }: { sort: TableSort }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={cx("size-3 shrink-0", sort === "none" ? "text-slate-300" : "text-slate-600")}
      fill="currentColor"
    >
      {sort !== "descending" && <path d="M6 1.5 9 5H3z" />}
      {sort !== "ascending" && <path d="M6 10.5 3 7h6z" />}
    </svg>
  );
}

/** A sortable column's title: a native button that fills the cell, named by the title. */
export function SortButton({
  sort,
  onSort,
  align,
  children,
}: SortProps & { align: Align; children: ReactNode }): ReactElement {
  return (
    <button
      type="button"
      onClick={() => onSort(nextSort(sort))}
      className={cx(
        "inline-flex w-full cursor-pointer items-center gap-1 rounded-sm uppercase tracking-wide hover:text-violet-700",
        JUSTIFY[align],
        focusRing,
      )}
    >
      {children}
      <SortArrow sort={sort} />
    </button>
  );
}
