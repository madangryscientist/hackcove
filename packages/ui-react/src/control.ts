import { focusRing } from "./cx.js";
import { controlText, type TypeStep } from "./density.js";
import type { Size } from "./size.js";

/** A control's size: the library's one `Size` scale. */
export type ControlSize = Size;

/** `full` fills the parent (the default); `fill` grows to the space left in a flex row; `auto` adds no width class, so the control is as wide as the browser makes it; the rest are fixed. */
export type ControlWidth = "full" | "fill" | "auto" | "xs" | "sm" | "md" | "lg";

/** The props `Input`, `Select` and `Textarea` share. They replace the native `size` and `width`. */
export type ControlProps = {
  /**
   * `sm` is compact, `text-sm` with less padding, for dense forms and table rows; `md` is `text-base`;
   * `lg` is `text-lg` with more padding, for a hero form. Under an `AppShell density="compact"` each
   * is one type step down, and on a touch screen a field is never under 16px.
   * @default md
   */
  size?: ControlSize | undefined;
  /** `full` (default) fills the parent; `fill` grows to fill the room left in a row beside other items (it can shrink to nothing, so buttons stay on the line); `xs`, `sm`, `md`, `lg` are fixed; `auto` adds no width class, so the control is as wide as the browser makes it. */
  width?: ControlWidth | undefined;
};

/** The vertical padding of a control; its type size is `controlText`'s, from the size and the type step. */
const CONTROL_PAD_Y: Record<ControlSize, string> = {
  sm: "py-1",
  md: "py-2",
  lg: "py-2.5",
};

/** One width class per control, so a fixed width never fights `w-full`. `auto` has none. */
export const CONTROL_WIDTH: Record<ControlWidth, string | undefined> = {
  full: "w-full",
  fill: "w-full min-w-0 flex-1",
  auto: undefined,
  xs: "w-20",
  sm: "w-28",
  md: "w-36",
  lg: "w-48",
};

/** A `numeric` `Input`'s figures: right-aligned and tabular, as a `numeric` table cell's. */
export const NUMERIC_VALUE = "text-right tabular-nums";

/** The horizontal padding of a control, and of an `Input`'s icon gutter. */
export const CONTROL_PAD: Record<ControlSize, { x: string; icon: string }> = {
  sm: { x: "px-2", icon: "pr-2 pl-7" },
  md: { x: "px-3", icon: "pr-3 pl-9" },
  lg: { x: "px-4", icon: "pr-4 pl-11" },
};

/** Shared look of text controls; `size` and the type `step` set the height and type, `width` the one width class. */
export function controlClass(
  size: ControlSize = "md",
  width: ControlWidth = "full",
  step?: TypeStep,
): string {
  return [
    CONTROL_WIDTH[width],
    CONTROL_PAD_Y[size],
    controlText(size, step, true),
    `rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-ellipsis transition hover:border-violet-400 aria-invalid:border-red-200 disabled:opacity-50 ${focusRing}`,
  ]
    .filter(Boolean)
    .join(" ");
}
