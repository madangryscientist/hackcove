import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { fieldNote } from "./Field.js";
import type { Passthrough } from "./props.js";

/** Relative widths in a `FormRow`: a field of `span` 2 is twice as wide as one of `span` 1. */
export type FormRowSpan = 1 | 2 | 3 | 4;

const SPAN: Record<FormRowSpan, string> = {
  1: "md:flex-1",
  2: "md:flex-2",
  3: "md:flex-3",
  4: "md:flex-4",
};

/**
 * Two columns of `Field`s from `md`, one below it. A `Field` takes one column; `span="full"` runs
 * it across both, and a `FormRow` is always full width.
 */
export function FormGrid({
  children,
  ...rest
}: { children: ReactNode } & Passthrough): ReactElement {
  return (
    <div {...rest} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {children}
    </div>
  );
}

/**
 * An inline-edit row: several controls side by side with proportional widths (`FormRowField`
 * `span` 1 to 4), an optional `action` after them (a save button), and one `hint` or `error` line
 * under the whole row. Every control sits on the bottom edge, so the action lines up with them
 * whatever the labels do. Under `md` the fields and the action stack.
 *
 * The row owns the note, so the fields beside each other keep their height: a `FormRowField` has
 * no `hint` or `error` of its own.
 */
export function FormRow({
  action,
  hint,
  error,
  children,
  ...rest
}: {
  /** A button or two after the last field. It keeps its own width. */
  action?: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when set, as `Field`'s does. */
  error?: ReactNode;
  children: ReactNode;
} & Passthrough): ReactElement {
  const note = fieldNote(hint, error);
  return (
    <div {...rest} className="col-span-full flex flex-col gap-1.5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {children}
        {action && <div className="flex items-center gap-2 md:shrink-0">{action}</div>}
      </div>
      {note}
    </div>
  );
}

/** A compact label over one control, for a `FormRow`. `span` is its share of the row (1 default). */
export function FormRowField({
  label,
  htmlFor,
  span = 1,
  children,
  ...rest
}: {
  label: ReactNode;
  /** The id of the control inside; the label's htmlFor. */
  htmlFor: string;
  span?: FormRowSpan | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={cx("flex min-w-0 flex-col gap-1", SPAN[span])}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
