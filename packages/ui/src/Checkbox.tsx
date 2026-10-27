import { type ComponentPropsWithoutRef, type ReactElement, type ReactNode, useId } from "react";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

/** The label's gap and text, the box, and the box's drop onto the first line, by `size`. */
const SIZE: Record<Size, { label: string; box: string; start: string }> = {
  sm: { label: "gap-1.5 text-xs", box: "h-3.5 w-3.5", start: "mt-px" },
  md: { label: "gap-2 text-sm", box: "h-4 w-4", start: "mt-0.5" },
  lg: { label: "gap-2.5 text-base", box: "h-5 w-5", start: "mt-0.5" },
};

/** The label, with its muted description under it when there is one. */
function Words({
  label,
  description,
  id,
}: {
  label: ReactNode;
  description: ReactNode;
  id: string | undefined;
}): ReactNode {
  if (id === undefined) return label;
  return (
    <span className="flex flex-col gap-0.5">
      <span>{label}</span>
      <span id={id} className="text-xs text-slate-500">
        {description}
      </span>
    </span>
  );
}

/** The description's id (none without a description) and the box's whole `aria-describedby`. */
function useDescription(description: ReactNode, describedBy: string | undefined) {
  const generatedId = useId();
  const descriptionId = description != null && description !== false ? generatedId : undefined;
  return { descriptionId, describedIds: [describedBy, descriptionId].filter(Boolean).join(" ") };
}

/**
 * A native checkbox with its label. Every prop but the label goes on the input.
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
  label?: ReactNode;
  /** A muted line under the label that says more. It is the box's `aria-describedby`. */
  description?: ReactNode;
  /**
   * The label's text size and the box with it.
   * @default md
   */
  size?: Size | undefined;
  align?: "center" | "start" | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width">>): ReactElement {
  const { descriptionId, describedIds } = useDescription(description, describedBy);
  const start = align === "start" || descriptionId !== undefined;
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer text-slate-700",
        start ? "items-start" : "items-center",
        SIZE[size].label,
      )}
    >
      <input
        type="checkbox"
        className={cx(
          SIZE[size].box,
          "shrink-0",
          start && SIZE[size].start,
          "accent-violet-600",
          focusRing,
        )}
        {...(describedIds ? { "aria-describedby": describedIds } : {})}
        {...rest}
      />
      <Words label={label} description={description} id={descriptionId} />
    </label>
  );
}
