import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

export type ButtonVariant = "primary" | "outline" | "ghost";

const SHAPE =
  "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition";
// A plain `disabled` washes out and ignores the pointer. Blocked and busy buttons are disabled too,
// but they keep pointer events (the title shows, the cursor says why) and do not take this.
const DISABLED_PLAIN = "disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<ButtonVariant, { color: string; hover: string }> = {
  primary: {
    color: "border-violet-600 bg-violet-600 text-violet-50",
    hover: "hover:bg-violet-700",
  },
  outline: { color: "border-violet-600 text-violet-600", hover: "hover:bg-violet-50" },
  ghost: { color: "border-transparent text-slate-600", hover: "hover:bg-slate-100" },
};

// Blocked replaces the variant's colour and hover rather than overriding them, so no `!` is needed.
const BLOCKED = "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400";
const BUSY = "cursor-progress opacity-85";

/** The classes of a Button, for a router's own <Link> that should look like one. */
export function buttonClass(variant: ButtonVariant = "primary"): string {
  return cx(SHAPE, DISABLED_PLAIN, focusRing, VARIANT[variant].color, VARIANT[variant].hover);
}

type ButtonProps = {
  variant?: ButtonVariant;
  /** Why the button cannot be pressed: disables it, sets it as the `title`, and greys it flat. */
  disabledReason?: string | undefined;
  /** The work is in flight: disabled, `aria-busy`, keeps its colour. Wins over `disabledReason`. */
  busy?: boolean | undefined;
  /** The label while `busy`, in place of the children. */
  busyLabel?: string | undefined;
} & ComponentPropsWithoutRef<"button">;

/** The classes of a Button in a given state: blocked swaps the colour out, busy keeps it. */
function stateClass(variant: ButtonVariant, blocked: boolean, busy: boolean): string {
  const { color } = VARIANT[variant];
  if (blocked) return cx(SHAPE, focusRing, BLOCKED);
  if (busy) return cx(SHAPE, focusRing, color, BUSY);
  return buttonClass(variant);
}

/**
 * A button in the primary, outline or ghost style. Defaults to `type="button"`. `disabledReason`
 * and `busy` are the two disabled states that say more than a plain `disabled`, which keeps its
 * half-opacity look.
 */
export function Button({
  variant = "primary",
  disabledReason,
  busy = false,
  busyLabel,
  className,
  children,
  title,
  disabled,
  ...rest
}: ButtonProps): ReactElement {
  const blocked = disabledReason !== undefined && !busy;
  return (
    <button
      type="button"
      className={cx(stateClass(variant, blocked, busy), className)}
      disabled={disabled || busy || blocked}
      aria-busy={busy || undefined}
      title={blocked ? disabledReason : title}
      {...rest}
    >
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
