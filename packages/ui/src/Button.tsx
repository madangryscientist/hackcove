import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

export type ButtonVariant = "primary" | "outline" | "ghost" | "link" | "dashed";
export type ButtonSize = Size;
export type ButtonTone = "default" | "positive" | "danger";

const SHAPE = "inline-flex items-center justify-center rounded-lg border font-medium transition";
// Size sets the padding and the text. The link variant has no box, so it takes the text size only.
const SIZE: Record<ButtonSize, { box: string; text: string }> = {
  sm: { box: "gap-1.5 px-2.5 py-1", text: "text-xs" },
  md: { box: "gap-2 px-4 py-2", text: "text-sm" },
  lg: { box: "gap-2 px-5 py-2.5", text: "text-base" },
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
  positive: {
    primary: {
      color: "border-emerald-600 bg-emerald-600 text-emerald-50",
      hover: "hover:bg-emerald-700",
    },
    outline: { color: "border-emerald-200 text-emerald-700", hover: "hover:bg-emerald-50" },
    ghost: { color: "border-transparent text-emerald-700", hover: "hover:bg-emerald-50" },
    link: { color: `border-transparent text-emerald-700 ${LINK}`, hover: "hover:underline" },
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

// An outline or ghost Button with `pressed` set is a toggle, such as a filter chip: off is neutral
// (the surface, a hairline, muted text, lit with the accent on hover), on is the tone's primary
// fill, so the selected one stands out in every theme. A primary is already filled, and link and
// dashed have no selected state; with `pressed` left out, outline and ghost keep their own look.
const TOGGLE_OFF: Look = {
  color: "border-slate-200 bg-white text-slate-600",
  hover: "hover:border-violet-400",
};

function lookOf(variant: ButtonVariant, tone: ButtonTone, pressed?: boolean): Look {
  if (variant === "dashed") return DASHED;
  if (pressed !== undefined && (variant === "outline" || variant === "ghost")) {
    return pressed ? TONE[tone].primary : TOGGLE_OFF;
  }
  return TONE[tone][variant];
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
  /**
   * `primary` is filled, for the one main action; `outline` and `ghost` are quieter; `link` is
   * text with an underline on hover; `dashed` is an "add another" row that fills its container.
   * @default primary
   */
  variant?: ButtonVariant | undefined;
  /**
   * `sm` is compact, for table rows and toolbars; `lg` is larger, for a hero call to action.
   * @default md
   */
  size?: ButtonSize | undefined;
  /**
   * `positive` is green, for accept and approve; `danger` is red, for delete and clear. Not for
   * `dashed`, which has the one look.
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

/** The classes of an idle Button: what `href` draws, and what the tests compare against. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  { size = "md", tone = "default" }: Omit<ButtonLook, "variant"> = {},
): string {
  return idleClass(variant, size, tone);
}

function idleClass(
  variant: ButtonVariant,
  size: ButtonSize,
  tone: ButtonTone,
  pressed?: boolean,
): string {
  const look = lookOf(variant, tone, pressed);
  return cx(shape(variant, size), DISABLED_PLAIN, look.color, look.hover);
}

type ButtonAsButton = ButtonLook & {
  /** Why the button cannot be pressed: disables it, sets it as the `title`, and greys it flat. */
  disabledReason?: string | undefined;
  /** The work is in flight: disabled, `aria-busy`, keeps its colour. Wins over `disabledReason`. */
  busy?: boolean | undefined;
  /** The label while `busy`, in place of the children. */
  busyLabel?: string | undefined;
  /**
   * A toggle: sets `aria-pressed`. On `outline` and `ghost`, `false` draws the neutral off look
   * and `true` the tone's primary fill, so a row of filter chips shows the selected one plainly.
   * Left out, the button is not a toggle, has no `aria-pressed` and keeps its variant's look.
   */
  pressed?: boolean | undefined;
  href?: undefined;
  render?: undefined;
  external?: undefined;
} & Unstyled<ComponentPropsWithoutRef<"button">>;

type ButtonAsLink = ButtonLook & {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  disabledReason?: undefined;
  busy?: undefined;
  busyLabel?: undefined;
  pressed?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href">> &
  (
    | {
        /** Makes the button a link to this URL. */
        href: string;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/quotes" {...p} />`. */
        render?: LinkRender | undefined;
      }
    | {
        /** Makes the button a link to this URL. */
        href?: string | undefined;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/quotes" {...p} />`. */
        render: LinkRender;
      }
  );

type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLink(props: ButtonProps): props is ButtonAsLink {
  return props.href !== undefined || props.render !== undefined;
}

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
  pressed: boolean | undefined,
): string {
  if (state === "blocked") {
    return cx(shape(variant, size), BLOCKED_BY_VARIANT[variant] ?? BLOCKED);
  }
  if (state === "busy") return cx(shape(variant, size), lookOf(variant, tone, pressed).color, BUSY);
  return idleClass(variant, size, tone, pressed);
}

/**
 * A button in the primary, outline, ghost, link or dashed style (the link has no box: text with an
 * underline on hover, for an in-line action; `dashed` is the full-width "add" row, a dashed
 * outline with muted text that fills its container, with an optional leading icon in the
 * children). `size="sm"` is compact and `size="lg"` larger; `tone="positive"` is green and `tone="danger"` is red;
 * `pressed` makes it a toggle: neutral when off, the tone's fill when on.
 * Defaults to `type="button"`. `disabledReason` and `busy` are the two disabled states that say
 * more than a plain `disabled`, which keeps its half-opacity look. `href` makes it a link instead,
 * with the same look (a plain `<a>`, or with `render` the app's own router `<Link>`:
 * `render={(p) => <Link to="/quotes" {...p} />}`; `external` opens a new tab).
 */
export function Button(props: ButtonProps): ReactElement {
  return isLink(props) ? <LinkButton {...props} /> : <PlainButton {...props} />;
}

function LinkButton({
  variant = "primary",
  size = "md",
  tone = "default",
  href,
  render,
  external = false,
  children,
  ...rest
}: ButtonAsLink): ReactElement {
  return renderLink({
    ...rest,
    href,
    render,
    external,
    className: buttonClass(variant, { size, tone }),
    children,
  });
}

function PlainButton({
  variant,
  size,
  tone,
  disabledReason,
  busy = false,
  busyLabel,
  pressed,
  children,
  title,
  disabled,
  ...rest
}: ButtonAsButton): ReactElement {
  const state = stateOf(busy, disabledReason);
  const blocked = state === "blocked";
  return (
    <button
      type="button"
      className={stateClass({ variant, size, tone }, state, pressed)}
      disabled={disabled || busy || blocked}
      aria-busy={busy || undefined}
      aria-pressed={pressed}
      title={blocked ? disabledReason : title}
      {...rest}
    >
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
