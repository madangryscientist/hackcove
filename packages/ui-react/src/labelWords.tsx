import { type ReactNode, useId } from "react";

/** Whether a note is set: `null`, `undefined`, `false` and `""` draw nothing. */
const given = (note: ReactNode): boolean => note != null && note !== false && note !== "";

/**
 * The label, with its note under it when there is one: the error (`role="alert"`, red) when set,
 * else the muted hint.
 */
export function Words({
  label,
  hint,
  error,
  id,
}: {
  label: ReactNode;
  hint: ReactNode;
  error: ReactNode;
  id: string | undefined;
}): ReactNode {
  if (id === undefined) return label;
  const failed = given(error);
  return (
    <span className="flex flex-col gap-0.5">
      <span>{label}</span>
      <span
        id={id}
        role={failed ? "alert" : undefined}
        className={failed ? "text-xs text-red-700" : "text-xs text-slate-500"}
      >
        {failed ? error : hint}
      </span>
    </span>
  );
}

/**
 * The note's id (none without a hint or an error), the control's whole `aria-describedby`, and
 * whether it is invalid (an error is set). The error replaces the hint, as in a `Field`.
 */
export function useNote(hint: ReactNode, error: ReactNode, describedBy: string | undefined) {
  const generatedId = useId();
  const invalid = given(error);
  const noteId = invalid || given(hint) ? generatedId : undefined;
  return {
    noteId,
    describedIds: [describedBy, noteId].filter(Boolean).join(" "),
    invalid,
  };
}
