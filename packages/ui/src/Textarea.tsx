import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/** A multi-line text input, styled like `Input`. `rows` defaults to 3. Takes `size` and `width` too. */
export function Textarea({
  size = "md",
  width = "full",
  ...rest
}: ControlProps & Unstyled<Omit<ComponentPropsWithoutRef<"textarea">, "width">>): ReactElement {
  return (
    <textarea rows={3} {...rest} className={cx(controlClass(size, width), CONTROL_PAD[size].x)} />
  );
}
