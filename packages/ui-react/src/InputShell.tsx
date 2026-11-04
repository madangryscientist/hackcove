import type { ReactElement, ReactNode } from "react";
import { CONTROL_WIDTH, type ControlProps, type ControlSize, controlClass } from "./control.js";
import { cx } from "./cx.js";

/** Where a leading icon sits, and its size, by the control's size. */
const ICON: Record<ControlSize, string> = {
  sm: "left-2 [&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "left-3 [&>svg]:h-4 [&>svg]:w-4",
  lg: "left-4 [&>svg]:h-5 [&>svg]:w-5",
};

/** The prefix text's inset and size, by the control's size. */
const PREFIX: Record<ControlSize, string> = {
  sm: "pl-2 text-xs",
  md: "pl-3 text-sm",
  lg: "pl-4 text-base",
};

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
            ICON[size],
          )}
        >
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

/**
 * The field box of an `Input` with a `prefix`: the control look and the focus ring sit on the
 * wrapper, around the prefix text and the borderless input. Not exported from the package.
 */
export function PrefixShell({
  prefix,
  size = "md",
  width = "full",
  disabled,
  children,
}: {
  prefix: string;
  disabled: boolean | undefined;
  children: ReactNode;
} & ControlProps): ReactElement {
  return (
    <div
      className={cx(
        controlClass(size, width),
        "flex items-center has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-600",
        width === "auto" && "inline-flex",
        disabled && "opacity-50",
      )}
    >
      <span className={cx("shrink-0 select-none text-slate-500", PREFIX[size])}>{prefix}</span>
      {children}
    </div>
  );
}
