import type { ReactElement, ReactNode } from "react";
import { CONTROL_WIDTH, type ControlProps } from "./control.js";
import { cx } from "./cx.js";

/** The relative wrapper of an `Input` that holds more than the field: a leading `icon` and, for search, the clear button. Not exported from the package. */
export function InputShell({
  icon,
  size = "md",
  width = "full",
  children,
}: { icon?: ReactNode; children: ReactNode } & ControlProps): ReactElement {
  return (
    <div
      className={cx(
        "relative",
        width === "auto" && "inline-block",
        width !== "full" && CONTROL_WIDTH[width],
      )}
    >
      {icon !== undefined && (
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400",
            size === "sm" ? "left-2 [&>svg]:h-3.5 [&>svg]:w-3.5" : "left-3 [&>svg]:h-4 [&>svg]:w-4",
          )}
        >
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
