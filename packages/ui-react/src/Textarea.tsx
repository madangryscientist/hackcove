import type { ComponentPropsWithoutRef, ReactElement, Ref } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import { useTypeStep } from "./density.js";
import { useFieldControl } from "./fieldControl.js";
import type { Unstyled } from "./props.js";

export type TextareaProps = ControlProps & {
  /** The monospace face, for pasted CSV or statement text, where the columns must line up. Off by default. */
  mono?: boolean | undefined;
  /** The `<textarea>` itself, for focus control. */
  ref?: Ref<HTMLTextAreaElement> | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"textarea">, "width">>;

/** A multi-line text input, styled like `Input`. `rows` defaults to 3. Takes `size`, `width` and `mono` too. The `ref` reaches the `<textarea>`, for focus control. */
export function Textarea({
  size = "md",
  width = "full",
  mono = false,
  ...rest
}: TextareaProps): ReactElement {
  const step = useTypeStep();
  const field = useFieldControl(rest);
  return (
    <textarea
      rows={3}
      {...rest}
      {...field}
      className={cx(controlClass(size, width, step), CONTROL_PAD[size].x, mono && "font-mono")}
    />
  );
}
