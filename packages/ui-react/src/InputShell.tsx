import type { ReactElement, ReactNode } from "react";
import { CONTROL_WIDTH, type ControlProps, type ControlSize, controlClass } from "./control.js";
import { cx } from "./cx.js";

/**
 * Where a leading icon sits, and its size, by the control's size. The wrapper is a flex box centred
 * on the field, so the icon's own box centres too, and its one child is sized whether it is a bare
 * `<svg>` or an `Icon`.
 */
const ICON: Record<ControlSize, string> = {
  sm: "left-2 [&>*]:size-3.5",
  md: "left-3 [&>*]:size-4",
  lg: "left-4 [&>*]:size-5",
};

/** The prefix text's inset and size, by the control's size. */
const PREFIX: Record<ControlSize, string> = {
  sm: "pl-2 text-xs",
  md: "pl-3 text-sm",
  lg: "pl-4 text-base",
};

/**
 * The relative wrapper of an `Input` that holds more than the field: a leading `icon` and, for search, the clear button. Not exported from the package.
 *
 * Inside a Card or row (`liftInteractive`, which is `isolate`) the field is lifted to `z-10`, and
 * its opaque background would paint over a z-auto icon. So the icon ranks `z-20` there. It is
 * scoped to an `isolate` ancestor so a field elsewhere on the page never outranks AppShell's
 * sticky header (`z-10`). The clear button is a lifted `button` and comes after the field, so it
 * already sits above it.
 */
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
            "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center leading-none text-slate-400 in-[.isolate]:z-20",
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
