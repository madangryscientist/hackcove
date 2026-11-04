import { type ComponentPropsWithoutRef, forwardRef, type ReactElement } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

export type TextareaProps = ControlProps & {
  /** The monospace face, for pasted CSV or statement text, where the columns must line up. Off by default. */
  mono?: boolean | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"textarea">, "width">>;

/** A multi-line text input, styled like `Input`. `rows` defaults to 3. Takes `size`, `width` and `mono` too. The `ref` reaches the `<textarea>`, for focus control. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = "md", width = "full", mono = false, ...rest },
  ref,
): ReactElement {
  return (
    <textarea
      rows={3}
      {...rest}
      ref={ref}
      className={cx(controlClass(size, width), CONTROL_PAD[size].x, mono && "font-mono")}
    />
  );
});
