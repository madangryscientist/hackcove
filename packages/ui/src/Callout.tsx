import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/** The colour family of a callout. */
export type CalloutTone = "neutral" | "info" | "positive" | "warn" | "danger";

/** The soft fill and border of each tone; a toned `Card` uses the same. */
export const TONE_SURFACE: Record<CalloutTone, string> = {
  neutral: "border-slate-200 bg-slate-50",
  info: "border-blue-200 bg-blue-50",
  positive: "border-emerald-200 bg-emerald-50",
  warn: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const TONE_TEXT: Record<CalloutTone, string> = {
  neutral: "text-slate-700",
  info: "text-blue-800",
  positive: "text-emerald-800",
  warn: "text-amber-800",
  danger: "text-red-800",
};

/**
 * A tinted notice box, with an optional bold title above its body. `actions` puts a button or link
 * at the end of the row; `banner` makes it a flat strip (bottom border only, no radius) for the
 * top of a `Card flush` and nowhere else: a padded card or a padded `FullBleedLayout` column
 * would inset it. In a page's column the notice is a plain Callout, first in the column's `Stack`. With `actions` the box is `relative`, so a `TextLink
 * stretch` there makes the whole callout its click target, like a link in a table row.
 */
export function Callout({
  tone = "info",
  title,
  actions,
  banner = false,
  children,
  ...rest
}: {
  /** Defaults to "info". */
  tone?: CalloutTone;
  /** A bold line above the body. */
  title?: ReactNode;
  /** A flat strip: `border-b` only and no radius, for the top of a `Card flush` only. */
  banner?: boolean;
  /** A button or link at the end of the row, beside the title and body. */
  actions?: ReactNode;
  children: ReactNode;
} & Unstyled<Omit<HTMLAttributes<HTMLDivElement>, "title">>): ReactElement {
  const content = title ? (
    <>
      <p className="font-semibold">{title}</p>
      <div className="mt-1">{children}</div>
    </>
  ) : (
    children
  );
  return (
    <div
      className={cx(
        Boolean(actions) && "relative",
        banner ? "border-b px-5 py-3 text-sm" : "rounded-xl border p-4 text-sm",
        TONE_SURFACE[tone],
        TONE_TEXT[tone],
      )}
      {...rest}
    >
      {actions ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">{content}</div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      ) : (
        content
      )}
    </div>
  );
}
