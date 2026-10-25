import { focusRing } from "./cx.js";

export type ControlSize = "md" | "sm";

/** `full` fills the parent (the default); `fill` grows to the space left in a flex row; `auto` is as wide as the content; the rest are fixed. */
export type ControlWidth = "full" | "fill" | "auto" | "xs" | "sm" | "md" | "lg";

/** The props `Input`, `Select` and `Textarea` share. They replace the native `size` and `width`. */
export type ControlProps = {
  /** `sm` is compact, `text-xs` with less padding, for dense forms and table rows. */
  size?: ControlSize | undefined;
  /** `full` (default) fills the parent; `fill` grows to fill the room left in a row beside other items (it can shrink to nothing, so buttons stay on the line); `xs`, `sm`, `md`, `lg` are fixed; `auto` is as wide as its content. */
  width?: ControlWidth | undefined;
};

const SIZE: Record<ControlSize, string> = { md: "py-2 text-sm", sm: "py-1 text-xs" };

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

/** Which edge an `Input`'s text sits on: `start` (default), or `end` for a numeric field. */
export type ControlAlign = "start" | "end";

/** The text alignment class of an `Input` with `align="end"`; `start` is the browser default and has none. */
export const CONTROL_ALIGN: Record<ControlAlign, string | undefined> = {
  start: undefined,
  end: "text-right",
};

/** The horizontal padding of a control, and of an `Input`'s icon gutter. */
export const CONTROL_PAD: Record<ControlSize, { x: string; icon: string }> = {
  md: { x: "px-3", icon: "pr-3 pl-9" },
  sm: { x: "px-2", icon: "pr-2 pl-7" },
};

/** Shared look of text controls; `size` sets the height and type, `width` the one width class. */
export function controlClass(size: ControlSize = "md", width: ControlWidth = "full"): string {
  return [
    CONTROL_WIDTH[width],
    SIZE[size],
    `rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 transition hover:border-violet-400 disabled:opacity-50 ${focusRing}`,
  ]
    .filter(Boolean)
    .join(" ");
}
