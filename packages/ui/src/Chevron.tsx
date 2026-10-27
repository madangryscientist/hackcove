import type { ReactElement } from "react";
import { cx } from "./cx.js";

/** The right-pointing chevron of a collapsible header; it turns down when `open`. */
export function Chevron({ open }: { open: boolean }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cx("h-4 w-4 shrink-0 text-slate-400", open && "rotate-90")}
    >
      <path
        fillRule="evenodd"
        d="M7.2 4.8a.75.75 0 0 1 1.06 0l4.7 4.67a.75.75 0 0 1 0 1.06l-4.7 4.67a.75.75 0 1 1-1.06-1.06L11.37 10 7.2 5.86a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
