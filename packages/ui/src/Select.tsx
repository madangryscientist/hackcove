import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/** A native `<select>` styled like `Input`, keeping the browser's own arrow. Takes `size` and `width` too. */
export function Select({
  size = "md",
  width = "full",
  children,
  ...rest
}: ControlProps &
  Unstyled<Omit<ComponentPropsWithoutRef<"select">, "size" | "width">>): ReactElement {
  return (
    <select {...rest} className={cx(controlClass(size, width), CONTROL_PAD[size].x)}>
      {children}
    </select>
  );
}
