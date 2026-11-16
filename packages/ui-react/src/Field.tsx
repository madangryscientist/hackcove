import { type ReactElement, type ReactNode, useId } from "react";
import { cx } from "./cx.js";
import { FieldContext, type FieldControlContext } from "./fieldControl.js";
import type { Passthrough } from "./props.js";
import { ControlBone } from "./fieldWait.js";
import { BusyLabel, busy, type LoadingProps, useLoading } from "./skeleton.js";

/** The line under a control or a row: an error (`role="alert"`) replaces the hint; neither draws nothing. */
export function fieldNote(
  hint: ReactNode,
  error: ReactNode,
  ids?: { hint: string; error: string },
): ReactElement | null {
  if (error) {
    return (
      <p id={ids?.error} role="alert" className="text-xs text-red-700">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={ids?.hint} className="text-xs text-slate-500">
        {hint}
      </p>
    );
  }
  return null;
}

/** The control's id, the note's id and the note itself: the error, or else the hint, or nothing. */
function useFieldNote(
  htmlFor: string | undefined,
  hint: ReactNode,
  error: ReactNode,
): { control: FieldControlContext; note: ReactElement | null } {
  const generatedId = useId();
  const ids = { hint: useId(), error: useId() };
  const note = fieldNote(hint, error, ids);
  let describedBy: string | undefined;
  if (error) describedBy = ids.error;
  else if (hint) describedBy = ids.hint;
  return {
    control: { id: htmlFor ?? generatedId, describedBy, invalid: Boolean(error) },
    note,
  };
}

/** A field's label: hidden, or drawn, and free to wrap anywhere beside a control in a row. */
function labelLook(hidden: boolean, row: boolean): string {
  return hidden
    ? "sr-only"
    : cx("text-sm font-medium text-slate-700", row && "min-w-0 wrap-anywhere");
}

/**
 * A label above a control, with a hint or an error line under it. An error replaces the hint.
 * Inside a `FormGrid`, `span="full"` runs the field across both columns. The `Input`, `Select`,
 * `Textarea` or `FileDrop` inside takes the label, the note (`aria-describedby`) and, with an error,
 * `aria-invalid` and a red edge by itself: give it no `id` and the Field no `htmlFor`. While
 * `loading` the label is drawn and the control is a bone of its height, read from the density
 * around it (`sm` in a `sm` card or table).
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  span,
  layout = "column",
  labelHidden = false,
  loading,
  loadingLabel,
  children,
  ...rest
}: {
  /** The text above the control. */
  label: ReactNode;
  /** A fixed id for the control inside, only when something else must name it. Unset, the Field makes one. */
  htmlFor?: string | undefined;
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
  /**
   * Keeps the `label` in the page for assistive tech and draws no text, for a control whose purpose
   * is plain from what surrounds it (a search box in a toolbar). `label` stays required, so the
   * control always has a name. With `layout="row"` the field draws as a column: an empty label
   * column helps nobody.
   * @default false
   */
  labelHidden?: boolean | undefined;
  children: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const row = layout === "row" && !labelHidden;
  const { control, note } = useFieldNote(htmlFor, hint, error);
  const { loading: waiting, owner } = useLoading(loading);
  return (
    <div
      {...rest}
      {...busy(owner, waiting)}
      className={cx(
        row ? "grid grid-cols-[8rem_1fr] items-center gap-x-3 gap-y-1.5" : "flex flex-col gap-1.5",
        span === "full" && "col-span-full",
      )}
    >
      <label htmlFor={control.id} className={labelLook(labelHidden, row)}>
        {label}
      </label>
      <FieldContext.Provider value={control}>
        {waiting ? <ControlBone /> : children}
      </FieldContext.Provider>
      {note && row ? <div className="col-start-2">{note}</div> : note}
      <BusyLabel owner={owner} loading={waiting} label={loadingLabel} />
    </div>
  );
}
