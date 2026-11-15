import { type ComponentPropsWithoutRef, type ReactElement, type Ref, useContext } from "react";
import { CONTROL_PAD, controlClass, type ControlProps, type ControlSize } from "./control.js";
import { cx } from "./cx.js";
import { useTypeStep } from "./density.js";
import { FieldContext, useFieldControl } from "./fieldControl.js";
import type { Unstyled } from "./props.js";

/** The height of a `Select` by `size`, the `Input`'s 26px, 38px and 46px: a native `<select>` sizes its text from the font and ignores the line height, so padding alone falls short at `md` and `lg`. */
const SELECT_HEIGHT: Record<ControlSize, string> = { sm: "h-6.5", md: "h-9.5", lg: "h-11.5" };

/** One choice of a `Select`. */
export type SelectItem = {
  /** What the form posts and `onChange` reads. */
  value: string;
  /** What the list shows. */
  label: string;
  /** Shown but not choosable. */
  disabled?: boolean | undefined;
};

/**
 * A native `<select>` styled like `Input`, keeping the browser's own arrow, over its `items`. Takes
 * `size` and `width` too: inside a `Field` it fills the row, and on its own it is as wide as its
 * longest choice. The `ref` reaches the `<select>`.
 */
export function Select({
  items,
  size = "md",
  width,
  ...own
}: Omit<ControlProps, "width"> & {
  /** The choices, in order. */
  items: readonly SelectItem[];
  /**
   * As an `Input`'s `width`.
   * @default full inside a `Field`, `auto` outside one
   */
  width?: ControlProps["width"];
  /** The `<select>` itself, for focus control. */
  ref?: Ref<HTMLSelectElement> | undefined;
} & Unstyled<
    Omit<ComponentPropsWithoutRef<"select">, "size" | "width" | "children">
  >): ReactElement {
  const step = useTypeStep();
  const inField = useContext(FieldContext) !== undefined;
  const field = useFieldControl(own);
  return (
    <select
      {...own}
      {...field}
      className={cx(
        controlClass(size, width ?? (inField ? "full" : "auto"), step),
        SELECT_HEIGHT[size],
        CONTROL_PAD[size].x,
      )}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
