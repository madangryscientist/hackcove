import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";

/** A label above a control, with a hint or an error line under it. An error replaces the hint. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  /** The id of the control inside; the label's htmlFor. */
  htmlFor: string;
  hint?: ReactNode;
  /** Replaces the hint when set. */
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement {
  let note: ReactElement | null = null;
  if (error) {
    note = (
      <p role="alert" className="text-xs text-red-700">
        {error}
      </p>
    );
  } else if (hint) {
    note = <p className="text-xs text-slate-500">{hint}</p>;
  }
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {note}
    </div>
  );
}
