import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

export type IconButtonVariant = "outline" | "ghost";
export type IconButtonTone = "default" | "danger";

const BASE = `inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

const LOOK: Record<IconButtonTone, Record<IconButtonVariant, string>> = {
  default: {
    outline: "border-slate-200 text-slate-500 hover:bg-slate-50",
    ghost: "border-transparent text-slate-500 hover:bg-slate-100",
  },
  danger: {
    outline: "border-red-200 text-red-700 hover:bg-red-50",
    ghost: "border-transparent text-red-700 hover:bg-red-50",
  },
};

/**
 * A square button holding one icon. `label` is its accessible name and tooltip. `variant="ghost"`
 * drops the border for a quiet action in a row or a toolbar; `tone="danger"` is red, for delete
 * and clear. Defaults to `type="button"`.
 */
export function IconButton({
  label,
  variant = "outline",
  tone = "default",
  children,
  ...rest
}: {
  label: string;
  /**
   * `outline` has a border; `ghost` has none, until the hover fill.
   * @default outline
   */
  variant?: IconButtonVariant | undefined;
  /**
   * `danger` is red, for delete and clear.
   * @default default
   */
  tone?: IconButtonTone | undefined;
  children: ReactNode;
} & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>): ReactElement {
  return (
    <button
      type="button"
      {...rest}
      aria-label={label}
      title={label}
      className={cx(BASE, LOOK[tone][variant])}
    >
      {children}
    </button>
  );
}
