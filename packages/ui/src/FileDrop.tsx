import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

const PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-4 py-6", lg: "px-5 py-8" };

/**
 * A dashed drop zone around a file input. The input covers the whole zone, invisible, so a click
 * opens the file dialog and a file dragged onto it is taken by the browser as it is by any file
 * input. `children` is the prompt; show the chosen file's name there from `onChange`. The label also shows
 * the keyboard focus ring, the input being invisible. Every prop (`accept`, `multiple`, `name`, `disabled`, `onChange`) goes on the input.
 */
export function FileDrop({
  size = "md",
  children,
  ...rest
}: {
  /**
   * `sm` is a compact chip or tile: dense padding; `lg` is one step roomier than `md`.
   * @default md
   */
  size?: Size;
  children: ReactNode;
} & Unstyled<
  Omit<ComponentPropsWithoutRef<"input">, "type" | "children" | "size" | "width">
>): ReactElement {
  return (
    <label
      className={cx(
        "relative flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500 transition hover:border-violet-400 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-600",
        PAD[size],
        rest.disabled && "opacity-50",
      )}
    >
      <input
        type="file"
        className="absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0 disabled:cursor-not-allowed"
        {...rest}
      />
      {children}
    </label>
  );
}
