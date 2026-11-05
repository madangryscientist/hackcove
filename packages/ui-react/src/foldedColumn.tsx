import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";

/** The breakpoint a folded column opens up at: below it the column sits behind a disclosure. */
export type FoldFrom = "md" | "lg";

// Each variant is written out whole, so Tailwind sees every class.
const FOLD: Record<FoldFrom, { content: string; summary: string; body: string }> = {
  md: {
    content: "md:[&::details-content]:[content-visibility:visible]",
    summary: "md:hidden",
    body: "md:mt-0",
  },
  lg: {
    content: "lg:[&::details-content]:[content-visibility:visible]",
    summary: "lg:hidden",
    body: "lg:mt-0",
  },
};

/**
 * A side column that folds behind a native `<details>` disclosure named `label`, closed, below
 * `from`, and is the same column, always open, from `from` up. The column stays mounted while it is
 * folded, so state inside it is kept. Shared by `SidebarLayout` (`md`) and `SideColumn` (`lg`).
 */
export function FoldedColumn({
  from,
  label,
  children,
}: {
  from: FoldFrom;
  label: string;
  children: ReactNode;
}): ReactElement {
  const fold = FOLD[from];
  return (
    <details className={cx("group", fold.content)}>
      <summary
        className={cx(
          "flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 select-none hover:bg-slate-50 [&::-webkit-details-marker]:hidden",
          fold.summary,
          focusRing,
        )}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-slate-500 group-open:rotate-180"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <div className={cx("mt-2", fold.body)}>{children}</div>
    </details>
  );
}
