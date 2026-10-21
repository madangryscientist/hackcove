import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { controlClass } from "./control.js";
import { cx } from "./cx.js";

/** A multi-line text input, styled like `Input`. `rows` defaults to 3. */
export function Textarea({
  className,
  ...rest
}: ComponentPropsWithoutRef<"textarea">): ReactElement {
  return <textarea rows={3} {...rest} className={cx(controlClass, "px-3", className)} />;
}
