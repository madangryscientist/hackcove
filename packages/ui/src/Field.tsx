import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";

/** The line under a control or a row: an error (`role="alert"`) replaces the hint; neither draws nothing. */
export function fieldNote(hint: ReactNode, error: ReactNode): ReactElement | null {
  if (error) {
    return (
      <p role="alert" className="text-xs text-red-700">
        {error}
      </p>
    );
  }
  if (hint) {
    return <p className="text-xs text-slate-500">{hint}</p>;
  }
  return null;
}

/**
 * A label above a control, with a hint or an error line under it. An error replaces the hint.
 * Inside a `FormGrid`, `span="full"` runs the field across both columns.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  span,
  children,
  ...rest
}: {
  /** The text above the control. */
  label: ReactNode;
  /** The id of the control inside; the label's htmlFor. */
  htmlFor: string;
  /** A muted line under the control that says more. */
  hint?: ReactNode;
  /** Replaces the hint when set. */
  error?: ReactNode;
  /** `full` spans every column of a `FormGrid`; unset takes one. It does nothing outside a `FormGrid`. */
  span?: "full" | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={cx("flex flex-col gap-1.5", span === "full" && "col-span-full")}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {fieldNote(hint, error)}
    </div>
  );
}
