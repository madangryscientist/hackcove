import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { useDescription, Words } from "./labelWords.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

/** The label's gap and text, the box, and the box's drop onto the first line, by `size`. */
const SIZE: Record<Size, { label: string; box: string; start: string }> = {
  sm: { label: "gap-1.5 text-xs", box: "h-3.5 w-3.5", start: "mt-px" },
  md: { label: "gap-2 text-sm", box: "h-4 w-4", start: "mt-0.5" },
  lg: { label: "gap-2.5 text-base", box: "h-5 w-5", start: "mt-0.5" },
};

/**
 * A checkbox with its label. It is a real `<input type="checkbox">`, drawn by the library (an
 * empty outlined box, then a filled violet one with a check mark) so it reads the same in every
 * theme and browser. Every prop but the label goes on the input.
 * `size="sm"` is `text-xs` and a smaller box, for a dense row; `size="lg"` is `text-base` and a
 * larger box. Leave `label` out for a bare box in
 * a table cell, and name it with `aria-label`. `align="start"` puts the box on the label's first
 * line, for a label that wraps onto several; the default centres it on the whole label. The box
 * keeps its size either way. `description` is a muted line under the label that says more, like a
 * `Field`'s hint; it is the box's `aria-describedby`, and with it the box sits on the label's first
 * line.
 */
export function Checkbox({
  label,
  description,
  size = "md",
  align = "center",
  "aria-describedby": describedBy,
  ...rest
}: {
  /** The text beside the box. Leave it out for a bare box (a table cell) and name it with `aria-label`. */
  label?: ReactNode;
  /** A muted line under the label that says more. It is the box's `aria-describedby`. */
  description?: ReactNode;
  /**
   * The label's text size and the box with it.
   * @default md
   */
  size?: Size | undefined;
  /**
   * `start` puts the box on the label's first line, for a label that wraps; `center` centres it on the whole label. A `description` makes it `start`.
   * @default center
   */
  align?: "center" | "start" | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width">>): ReactElement {
  const { descriptionId, describedIds } = useDescription(description, describedBy);
  const start = align === "start" || descriptionId !== undefined;
  return (
    <label
      className={cx(
        // Faded and default-cursor unless the box is enabled. Written as `has-enabled` so the
        // label carries no `disabled` class text: the disabled state belongs on the input.
        "group/checkbox inline-flex cursor-default text-slate-700 opacity-50 has-enabled:cursor-pointer has-enabled:opacity-100",
        start ? "items-start" : "items-center",
        SIZE[size].label,
      )}
    >
      {/* The checked box: a filled violet square at the input's own place (an absolutely
          positioned flex child sits where the first flex item would, so it needs no insets), shown
          by the label's `:has(:checked)` so an uncontrolled Checkbox changes with no re-render. */}
      <span
        aria-hidden="true"
        className={cx(
          SIZE[size].box,
          start && SIZE[size].start,
          "pointer-events-none invisible absolute z-10 block rounded border border-violet-600 bg-violet-600 text-violet-50 group-has-checked/checkbox:visible",
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
      <input
        type="checkbox"
        className={cx(
          SIZE[size].box,
          "shrink-0",
          start && SIZE[size].start,
          "appearance-none rounded border border-slate-300 bg-white hover:border-violet-400",
          focusRing,
        )}
        {...(describedIds ? { "aria-describedby": describedIds } : {})}
        {...rest}
      />
      <Words label={label} description={description} id={descriptionId} />
    </label>
  );
}
