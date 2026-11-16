import type { ChangeEvent, ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from "react";
import { cx, focusRing } from "./cx.js";
import { useNote, Words } from "./labelWords.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";
import { useBlocked } from "./blocked.js";

/** The label's gap and text, the box, and the box's drop onto the label's first line, by `size`. */
const SIZE: Record<Size, { label: string; box: string; start: string }> = {
  sm: { label: "gap-1.5 text-xs", box: "h-3.5 w-3.5", start: "mt-px" },
  md: { label: "gap-2 text-sm", box: "h-4 w-4", start: "mt-0.5" },
  lg: { label: "gap-2.5 text-base", box: "h-5 w-5", start: "mt-0.5" },
};

/** The tick: shown over the box when it is checked. */
function Tick({ size, onFirstLine }: { size: Size; onFirstLine: boolean }): ReactElement {
  /* The checked box: a filled violet square at the input's own place (an absolutely
    positioned flex child sits where the first flex item would, so it needs no insets), shown
    by the label's `:has(:checked)` so an uncontrolled Checkbox changes with no re-render.
    Inside a Card or table row the input is lifted to `z-10` by `liftInteractive` (cx.ts), and
    it comes later in the DOM, so the tick ranks `z-20` there to paint over it. Scoped to the
    `isolate` ancestor like the Input icon (InputShell.tsx), so it never outranks a sticky bar. */
  return (
    <span
      aria-hidden="true"
      className={cx(
        SIZE[size].box,
        onFirstLine && SIZE[size].start,
        "pointer-events-none invisible absolute in-[.isolate]:z-20 block rounded border border-violet-600 bg-violet-600 text-violet-50 group-has-checked/checkbox:visible",
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
        <path
          d="M4 8.5l2.5 2.5L12 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * A checkbox with its label. It is a real `<input type="checkbox">`, drawn by the library (an
 * empty outlined box, then a filled violet one with a check mark) so it reads the same in every
 * theme and browser. Every prop but the label goes on the input, and `ref` reaches it.
 * `size="sm"` is `text-xs` and a smaller box, for a dense row; `size="lg"` is `text-base` and a
 * larger box. Leave `label` out for a bare box in a table cell, and name it with `aria-label`. The
 * box sits on the label's first line, so a label that wraps reads from the box. `hint` is a muted
 * line under the label that says more, like a `Field`'s; `error` replaces it with a red line
 * (`role="alert"`) and makes the box `aria-invalid`. The note is the box's `aria-describedby`.
 * `onChange` gets the new checked state; take `checked` with it, or `defaultChecked` alone.
 */
export function Checkbox({
  label,
  hint,
  error,
  size = "md",
  onChange,
  disabledReason,
  "aria-describedby": describedBy,
  ...rest
}: {
  /** The text beside the box. Leave it out for a bare box (a table cell) and name it with `aria-label`. */
  label?: ReactNode;
  /** A muted line under the label that says more. It is the box's `aria-describedby`. */
  hint?: ReactNode;
  /** Replaces the hint with a red line (`role="alert"`) and makes the box `aria-invalid`. */
  error?: ReactNode;
  /**
   * The label's text size and the box with it.
   * @default md
   */
  size?: Size | undefined;
  /** Called with the new checked state when the person ticks or clears the box. */
  onChange?: ((checked: boolean) => void) | undefined;
  /**
   * Why the box cannot be changed: it dims and is blocked (`aria-disabled`; a click and Space
   * change nothing) while it stays in the tab order, and the reason is its tooltip on hover,
   * keyboard focus and a tap, read out as its description.
   */
  disabledReason?: string | undefined;
  /** The `<input>`, for focus control. */
  ref?: Ref<HTMLInputElement> | undefined;
} & Unstyled<
  Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width" | "onChange">
>): ReactElement {
  const { noteId, describedIds, invalid } = useNote(hint, error, describedBy);
  const {
    props: guard,
    tooltip,
    blocked,
  } = useBlocked(disabledReason, {
    ...rest,
    "aria-describedby": describedIds || undefined,
  });
  return (
    <>
      <label
        className={cx(
          // Faded and default-cursor unless the box is enabled. Written as `has-enabled` so the
          // label carries no `disabled` class text: the disabled state belongs on the input. A
          // blocked box is enabled (it keeps its focus) and fades as a disabled one does.
          "group/checkbox inline-flex items-start text-slate-700",
          blocked
            ? "cursor-not-allowed opacity-50"
            : "cursor-default opacity-50 has-enabled:cursor-pointer has-enabled:opacity-100",
          SIZE[size].label,
        )}
      >
        <Tick size={size} onFirstLine={label != null} />
        <input
          type="checkbox"
          className={cx(
            SIZE[size].box,
            "shrink-0",
            label != null && SIZE[size].start,
            "appearance-none rounded border border-slate-300 bg-white hover:border-violet-400",
            focusRing,
          )}
          {...(invalid ? { "aria-invalid": true } : {})}
          {...rest}
          {...guard}
          {...(onChange
            ? {
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                  if (!blocked) onChange(event.target.checked);
                },
              }
            : {})}
        />
        <Words label={label} hint={hint} error={error} id={noteId} />
      </label>
      {tooltip}
    </>
  );
}
