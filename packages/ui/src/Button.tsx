import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

export type ButtonVariant = "primary" | "outline" | "ghost" | "link" | "dashed";
export type ButtonSize = "md" | "sm";
export type ButtonTone = "default" | "danger";

const SHAPE = "inline-flex items-center justify-center rounded-lg border font-medium transition";
// Size sets the padding and the text. The link variant has no box, so it takes the text size only.
const SIZE: Record<ButtonSize, { box: string; text: string }> = {
  md: { box: "gap-2 px-4 py-2", text: "text-sm" },
  sm: { box: "gap-1.5 px-2.5 py-1", text: "text-xs" },
};
// A plain `disabled` washes out and ignores the pointer. Blocked and busy buttons are disabled too,
// but they keep pointer events (the title shows, the cursor says why) and do not take this.
const DISABLED_PLAIN = "disabled:pointer-events-none disabled:opacity-50";

type Look = { color: string; hover: string };

const LINK = "underline-offset-2";

const TONE: Record<ButtonTone, Record<Exclude<ButtonVariant, "dashed">, Look>> = {
  default: {
    primary: {
      color: "border-violet-600 bg-violet-600 text-violet-50",
      hover: "hover:bg-violet-700",
    },
    outline: { color: "border-violet-600 text-violet-600", hover: "hover:bg-violet-50" },
    ghost: { color: "border-transparent text-slate-600", hover: "hover:bg-slate-100" },
    link: {
      color: `border-transparent text-violet-600 ${LINK}`,
      hover: "hover:text-violet-700 hover:underline",
    },
  },
  danger: {
    primary: { color: "border-red-600 bg-red-600 text-red-50", hover: "hover:bg-red-700" },
    outline: { color: "border-red-200 text-red-700", hover: "hover:bg-red-50" },
    ghost: { color: "border-transparent text-red-700", hover: "hover:bg-red-50" },
    link: { color: `border-transparent text-red-700 ${LINK}`, hover: "hover:underline" },
  },
};

// The add row: Card dashed's outline and muted text, lit with the accent on hover. One look, so
// `tone` does not apply to it.
const DASHED: Look = {
  color: "border-slate-300 text-slate-500",
  hover: "hover:border-violet-400 hover:text-violet-700",
};

function lookOf(variant: ButtonVariant, tone: ButtonTone): Look {
  return variant === "dashed" ? DASHED : TONE[tone][variant];
}

// Blocked replaces the variant's colour and hover rather than overriding them, so no `!` is needed.
const BLOCKED = "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400";
const BLOCKED_DASHED = "cursor-not-allowed border-slate-200 text-slate-400";
const BLOCKED_LINK = "cursor-not-allowed border-transparent text-slate-400";
const BLOCKED_BY_VARIANT: Partial<Record<ButtonVariant, string>> = {
  link: BLOCKED_LINK,
  dashed: BLOCKED_DASHED,
};
const BUSY = "cursor-progress opacity-85";

/** Size, tone and variant: the look of a button, apart from its state. */
export type ButtonLook = {
  /** @default primary */
  variant?: ButtonVariant | undefined;
  /**
   * `sm` is compact, for table rows and toolbars.
   * @default md
   */
  size?: ButtonSize | undefined;
  /**
   * `danger` is red, for delete and clear. Not for `dashed`, which has the one look.
   * @default default
   */
  tone?: ButtonTone | undefined;
};

function shape(variant: ButtonVariant, size: ButtonSize): string {
  const { box, text } = SIZE[size];
  return cx(
    SHAPE,
    variant !== "link" && box,
    variant === "link" && "gap-1.5",
    variant === "dashed" && "w-full border-dashed",
    text,
    focusRing,
  );
}

/** The classes of a Button, for a router's own <Link> that should look like one. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  { size = "md", tone = "default" }: Omit<ButtonLook, "variant"> = {},
): string {
  const look = lookOf(variant, tone);
  return cx(shape(variant, size), DISABLED_PLAIN, look.color, look.hover);
}

type ButtonProps = ButtonLook & {
  /** Why the button cannot be pressed: disables it, sets it as the `title`, and greys it flat. */
  disabledReason?: string | undefined;
  /** The work is in flight: disabled, `aria-busy`, keeps its colour. Wins over `disabledReason`. */
  busy?: boolean | undefined;
  /** The label while `busy`, in place of the children. */
  busyLabel?: string | undefined;
} & ComponentPropsWithoutRef<"button">;

type State = "blocked" | "busy" | "idle";

/** Busy wins over blocked. */
function stateOf(busy: boolean, disabledReason: string | undefined): State {
  if (busy) return "busy";
  return disabledReason === undefined ? "idle" : "blocked";
}

/** The classes of a Button in a given state: blocked swaps the colour out, busy keeps it. */
function stateClass(
  { variant = "primary", size = "md", tone = "default" }: ButtonLook,
  state: State,
): string {
  if (state === "blocked") {
    return cx(shape(variant, size), BLOCKED_BY_VARIANT[variant] ?? BLOCKED);
  }
  if (state === "busy") return cx(shape(variant, size), lookOf(variant, tone).color, BUSY);
  return buttonClass(variant, { size, tone });
}

/**
 * A button in the primary, outline, ghost, link or dashed style (the link has no box: text with an
 * underline on hover, for an in-line action; `dashed` is the full-width "add" row, a dashed
 * outline with muted text that fills its container, with an optional leading icon in the
 * children). `size="sm"` is compact; `tone="danger"` is red.
 * Defaults to `type="button"`. `disabledReason` and `busy` are the two disabled states that say
 * more than a plain `disabled`, which keeps its half-opacity look.
 */
export function Button({
  variant,
  size,
  tone,
  disabledReason,
  busy = false,
  busyLabel,
  className,
  children,
  title,
  disabled,
  ...rest
}: ButtonProps): ReactElement {
  const state = stateOf(busy, disabledReason);
  const blocked = state === "blocked";
  return (
    <button
      type="button"
      className={cx(stateClass({ variant, size, tone }, state), className)}
      disabled={disabled || busy || blocked}
      aria-busy={busy || undefined}
      title={blocked ? disabledReason : title}
      {...rest}
    >
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
