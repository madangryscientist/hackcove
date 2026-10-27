import { type ComponentPropsWithoutRef, type ReactElement, type ReactNode, useId } from "react";
import type { ControlSize } from "./control.js";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

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
 * `size="sm"` is `text-xs` and a smaller box, for a dense row. Leave `label` out for a bare box in
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
  size?: ControlSize | undefined;
  align?: "center" | "start" | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "width">>): ReactElement {
  const small = size === "sm";
  const { descriptionId, describedIds } = useDescription(description, describedBy);
  const start = align === "start" || descriptionId !== undefined;
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer text-slate-700",
        start ? "items-start" : "items-center",
        small ? "gap-1.5 text-xs" : "gap-2 text-sm",
      )}
    >
      <input
        type="checkbox"
        className={cx(
          small ? "h-3.5 w-3.5" : "h-4 w-4",
          "shrink-0",
          start && (small ? "mt-px" : "mt-0.5"),
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
