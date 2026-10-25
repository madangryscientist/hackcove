import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { CONTROL_PAD, CONTROL_WIDTH, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";

/** A text input. `icon` puts a leading icon inside the field (e.g. a search glass). */
export function Input({
  icon,
  size = "md",
  width = "full",
  className,
  ...rest
}: { icon?: ReactNode } & ControlProps &
  Omit<ComponentPropsWithoutRef<"input">, "size" | "width">): ReactElement {
  if (icon === undefined) {
    return (
      <input {...rest} className={cx(controlClass(size, width), CONTROL_PAD[size].x, className)} />
    );
  }
  const small = size === "sm";
  return (
    <div
      className={cx(
        "relative",
        width === "auto" && "inline-block",
        width !== "full" && CONTROL_WIDTH[width],
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400",
          small ? "left-2 [&>svg]:h-3.5 [&>svg]:w-3.5" : "left-3 [&>svg]:h-4 [&>svg]:w-4",
        )}
      >
        {icon}
      </span>
      <input
        {...rest}
        className={cx(
          controlClass(size, width === "auto" ? "auto" : "full"),
          CONTROL_PAD[size].icon,
          className,
        )}
      />
    </div>
  );
}
