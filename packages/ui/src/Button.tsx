import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

export type ButtonVariant = "primary" | "outline" | "ghost";

const BASE = `inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border-violet-600 bg-violet-600 text-violet-50 hover:bg-violet-700",
  outline: "border-violet-600 text-violet-600 hover:bg-violet-50",
  ghost: "border-transparent text-slate-600 hover:bg-slate-100",
};

/** The classes of a Button, for a router's own <Link> that should look like one. */
export function buttonClass(variant: ButtonVariant = "primary"): string {
  return cx(BASE, VARIANT[variant]);
}

/** A button in the primary, outline or ghost style. Defaults to `type="button"`. */
export function Button({
  variant = "primary",
  className,
  ...rest
}: { variant?: ButtonVariant } & ComponentPropsWithoutRef<"button">): ReactElement {
  return <button type="button" className={cx(buttonClass(variant), className)} {...rest} />;
}
