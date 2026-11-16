import { type ComponentPropsWithoutRef, type ReactElement, type ReactNode, useId } from "react";
import { fieldNote } from "./Field.js";
import type { Unstyled } from "./props.js";

/**
 * A labelled group of controls: several `Checkbox`es answering one question, a set of `Field`s that
 * belong together, or the filter chips of one facet (a `ButtonGroup` of `outline` `sm` pressed
 * `Button`s). It is a `<fieldset>` named by its `label`, drawn as its `<legend>` in the `Field`
 * label's look, over the children in one column; a `ButtonGroup` or a `FormGrid` inside lays out a
 * row. `hint` is a muted line under the group and its `aria-describedby`; `error` replaces it in red
 * with `role="alert"`. `disabled` disables every control inside. One choice of several is a
 * `RadioGroup`, never inside a `Fieldset`. Other props go on the `<fieldset>`.
 */
export function Fieldset({
  label,
  hint,
  error,
  children,
  "aria-describedby": ownDescribedBy,
  ...rest
}: {
  /** The group's name, drawn as its `<legend>`. */
  label: ReactNode;
  /** A muted line under the group. */
  hint?: ReactNode;
  /** A red line under the group, in place of the hint, announced as an alert. */
  error?: ReactNode;
  /** `Checkbox`es, `Field`s (in a `FormGrid` for a row), or a `ButtonGroup` of chips. */
  children: ReactNode;
} & Unstyled<ComponentPropsWithoutRef<"fieldset">>): ReactElement {
  const ids = { hint: useId(), error: useId() };
  let note: string | undefined;
  if (error) note = ids.error;
  else if (hint) note = ids.hint;
  const describedBy = [ownDescribedBy, note].filter(Boolean).join(" ");
  return (
    <fieldset
      {...rest}
      aria-describedby={describedBy === "" ? undefined : describedBy}
      className="min-w-0"
    >
      <legend className="text-sm font-medium text-slate-700">{label}</legend>
      <div className="mt-2 flex flex-col gap-2.5">{children}</div>
      {(error || hint) && <div className="mt-1.5">{fieldNote(hint, error, ids)}</div>}
    </fieldset>
  );
}
