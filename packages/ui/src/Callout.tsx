import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";

/** The colour family of a callout. */
export type CalloutTone = "neutral" | "info" | "positive" | "warn" | "danger";

const TONES: Record<CalloutTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
};

/**
 * A tinted notice box, with an optional bold title above its body. `actions` puts a button or link
 * at the end of the row; `banner` makes it a flat strip (bottom border only, no radius) for the
 * top of a `Card flush` (a padded card would inset it).
 */
export function Callout({
  tone = "info",
  title,
  actions,
  banner = false,
  children,
  className,
  ...rest
}: {
  /** Defaults to "info". */
  tone?: CalloutTone;
  title?: ReactNode;
  /** A button or link at the end of the row, beside the title and body. */
  actions?: ReactNode;
  /** A flat strip: `border-b` only and no radius, to sit above a card body. */
  banner?: boolean;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">): ReactElement {
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
        banner ? "border-b px-5 py-3 text-sm" : "rounded-xl border p-4 text-sm",
        TONES[tone],
        className,
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
