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

/** A tinted notice box, with an optional bold title above its body. */
export function Callout({
  tone = "info",
  title,
  children,
  className,
  ...rest
}: {
  /** Defaults to "info". */
  tone?: CalloutTone;
  title?: ReactNode;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">): ReactElement {
  return (
    <div className={cx("rounded-xl border p-4 text-sm", TONES[tone], className)} {...rest}>
      {title ? (
        <>
          <p className="font-semibold">{title}</p>
          <div className="mt-1">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
