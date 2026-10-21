import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { controlClass } from "./control.js";
import { cx } from "./cx.js";

/** A native `<select>` styled like `Input`, keeping the browser's own arrow. */
export function Select({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"select">): ReactElement {
  return (
    <select {...rest} className={cx(controlClass, "px-3", className)}>
      {children}
    </select>
  );
}
