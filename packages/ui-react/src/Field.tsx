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
  layout = "column",
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
  /**
   * `row` puts the label beside the control, for a compact setting or a drawer row; the hint or
   * error sits under the control. Every row label takes the same fixed column, so stacked rows line
   * their controls up; a long label wraps inside it. `column` puts the label above it.
   * @default column
   */
  layout?: "column" | "row" | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const row = layout === "row";
  const note = fieldNote(hint, error);
  return (
    <div
      {...rest}
      className={cx(
        row ? "grid grid-cols-[8rem_1fr] items-center gap-x-3 gap-y-1.5" : "flex flex-col gap-1.5",
        span === "full" && "col-span-full",
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cx("text-sm font-medium text-slate-700", row && "min-w-0 wrap-anywhere")}
      >
        {label}
      </label>
      {children}
      {note && row ? <div className="col-start-2">{note}</div> : note}
    </div>
  );
}
