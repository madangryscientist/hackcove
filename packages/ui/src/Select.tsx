import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CONTROL_PAD, controlClass, type ControlProps, type ControlSize } from "./control.js";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/** The height of a `Select` by `size`, the `Input`'s 26px, 38px and 46px: a native `<select>` sizes its text from the font and ignores the line height, so padding alone falls short at `md` and `lg`. */
const SELECT_HEIGHT: Record<ControlSize, string> = { sm: "h-6.5", md: "h-9.5", lg: "h-11.5" };

/** A native `<select>` styled like `Input`, keeping the browser's own arrow. Takes `size` and `width` too. */
export function Select({
  size = "md",
  width = "full",
  children,
  ...rest
}: ControlProps &
  Unstyled<Omit<ComponentPropsWithoutRef<"select">, "size" | "width">>): ReactElement {
  return (
    <select
      {...rest}
      className={cx(controlClass(size, width), SELECT_HEIGHT[size], CONTROL_PAD[size].x)}
    >
      {children}
    </select>
  );
}
