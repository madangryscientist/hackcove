import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from "react";
import { cx, focusRing } from "./cx.js";
import { controlText, type TypeStep, useDensity, useTypeStep } from "./density.js";
import { Icon } from "./Icon.js";
import type { IconName } from "./icons.js";
import { blockedProps } from "./blocked.js";
import { renderLink } from "./link.js";
import { Tipped } from "./Tooltip.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";
import type { Tone } from "./tone.js";

export type ButtonVariant = "primary" | "outline" | "ghost" | "link" | "dashed";
export type ButtonSize = Size;
/** A Button's tones: `neutral` (the accent fill, the default), `positive` and `danger`. */
export type ButtonTone = Extract<Tone, "neutral" | "positive" | "danger">;

const SHAPE = "inline-flex items-center justify-center rounded-lg border font-medium transition";
// Size sets the padding; the text is `controlText`'s, from the size and the type step. The link
// variant has no box, so it takes the text size only.
const BOX: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-2.5 py-1",
  md: "gap-2 px-4 py-2",
  lg: "gap-2 px-5 py-2.5",
};
// A plain `disabled` washes out and ignores the pointer. A busy button is disabled too, but keeps
// pointer events (the cursor says why) and does not take this; a blocked one is `aria-disabled`.
const DISABLED_PLAIN = "disabled:pointer-events-none disabled:opacity-50";

type Look = { color: string; hover: string };

const LINK = "underline-offset-2";

const TONE: Record<ButtonTone, Record<Exclude<ButtonVariant, "dashed">, Look>> = {
  neutral: {
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

// The count chip: a pill in the button's own text colour (a hairline of `currentColor`), so it reads
// on every variant and tone and needs no palette entry. The size is a Badge's.
const COUNT =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-current px-1 text-[10px] font-semibold leading-none tabular-nums";

/** The label, then the count chip. The comma is for a screen reader only, so the name reads "Splits, 3". */
function withCount(children: ReactNode, count: number | undefined): ReactNode {
  if (count === undefined) return children;
  return (
    <>
      {children}
      <span className="sr-only">, </span>
      <span className={COUNT}>{count}</span>
    </>
  );
}

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
type ButtonLook = {
  /**
   * `primary` is filled, for the one main action; `outline` and `ghost` are quieter; `link` is
   * text with an underline on hover; `dashed` is an "add another" row that fills its container.
   * @default primary
   */
  variant?: ButtonVariant | undefined;
  /**
   * `sm` is compact, for table rows and toolbars; `lg` is larger, for a hero call to action. Left
   * out, a Button takes the size of the `Card`, `ListRow` or `Table` it sits in, else `md`.
   * @default md
   */
  size?: ButtonSize | undefined;
  /**
   * `positive` is green, for accept and approve; `danger` is red, for delete and clear. Not for
   * `dashed`, which has the one look.
   * @default neutral
   */
  tone?: ButtonTone | undefined;
  /** An icon from the `Icon` set before the label, decorative, at the button's size. */
  icon?: IconName | undefined;
};

function shape(variant: ButtonVariant, size: ButtonSize, step: TypeStep | undefined): string {
  return cx(
    SHAPE,
    variant !== "link" && BOX[size],
    variant === "link" && "gap-1.5",
    variant === "dashed" && "w-full border-dashed",
    controlText(size, step, false),
    focusRing,
  );
}

/** The classes of an idle Button: what `href` draws, and what the tests compare against. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  { size = "md", tone = "neutral" }: Omit<ButtonLook, "variant" | "icon"> = {},
  step?: TypeStep,
): string {
  return idleClass(variant, size, tone, { step });
}

function idleClass(
  variant: ButtonVariant,
  size: ButtonSize,
  tone: ButtonTone,
  { step, pressed }: { step: TypeStep | undefined; pressed?: boolean | undefined },
): string {
  const look = lookOf(variant, tone, pressed);
  return cx(shape(variant, size, step), DISABLED_PLAIN, look.color, look.hover);
}

type ButtonAsButton = ButtonLook & {
  /**
   * Why the button cannot be pressed: greys it flat and blocks it (`aria-disabled`, its click,
   * Enter and Space do nothing) while it stays in the tab order, and shows the reason as its
   * tooltip on hover, keyboard focus and a tap, read out as its description.
   */
  disabledReason?: string | undefined;
  /**
   * The work is in flight: disabled, `aria-busy`, keeps its colour. Wins over `disabledReason`. A
   * string is also the label while busy, in place of the children: `busy={saving && "Saving"}`.
   */
  busy?: boolean | string | undefined;
  /**
   * A toggle: sets `aria-pressed`. On `outline` and `ghost`, `false` draws the neutral off look
   * and `true` the tone's primary fill, so a row of filter chips shows the selected one plainly.
   * Left out, the button is not a toggle, has no `aria-pressed` and keeps its variant's look.
   */
  pressed?: boolean | undefined;
  /**
   * A small number in a chip after the label: how many are behind the button (the splits a row
   * has, the comments on a thread). It is part of the button's name, "Splits, 3", and `0` is
   * shown. For a button that opens something, also pass `aria-expanded`.
   */
  count?: number | undefined;
  href?: undefined;
  external?: undefined;
  /** Reaches the `<button>`, to focus it or measure it. */
  ref?: Ref<HTMLButtonElement> | undefined;
} & Unstyled<ComponentPropsWithoutRef<"button">>;

type ButtonAsLink = ButtonLook & {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  disabledReason?: undefined;
  busy?: undefined;
  pressed?: undefined;
  /**
   * A small number in a chip after the label: how many are behind the button (the splits a row
   * has, the comments on a thread). It is part of the button's name, "Splits, 3", and `0` is
   * shown. For a button that opens something, also pass `aria-expanded`.
   */
  count?: number | undefined;
  /** Makes the button a link to this URL; an in-app path goes through the app's `LinkProvider`. */
  href: string;
  /** Reaches the `<a>`, to focus it or measure it. */
  ref?: Ref<HTMLAnchorElement> | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href">>;

type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLink(props: ButtonProps): props is ButtonAsLink {
  return props.href !== undefined;
}

type State = "blocked" | "busy" | "idle";

/** Busy wins over blocked. */
function stateOf(busy: boolean, disabledReason: string | undefined): State {
  if (busy) return "busy";
  return disabledReason === undefined ? "idle" : "blocked";
}

/** The classes of a Button in a given state: blocked swaps the colour out, busy keeps it. */
function stateClass(
  { variant = "primary", size = "md", tone = "neutral" }: ButtonLook,
  state: State,
  pressed: boolean | undefined,
  step: TypeStep | undefined,
): string {
  if (state === "blocked") {
    return cx(shape(variant, size, step), BLOCKED_BY_VARIANT[variant] ?? BLOCKED);
  }
  if (state === "busy") {
    return cx(shape(variant, size, step), lookOf(variant, tone, pressed).color, BUSY);
  }
  return idleClass(variant, size, tone, { step, pressed });
}

/**
 * A button in the primary, outline, ghost, link or dashed style (the link has no box: text with an
 * underline on hover, for an in-line action; `dashed` is the full-width "add" row, a dashed
 * outline with muted text that fills its container). `icon` puts an `Icon` before the label.
 * `size="sm"` is compact and `size="lg"` larger, and with no `size` it takes its container's;
 * `tone="positive"` is green and `tone="danger"` is red;
 * `pressed` makes it a toggle: neutral when off, the tone's fill when on. `count` puts a small
 * number chip after the label; the chip is part of the name, and a button that opens something
 * also takes `aria-expanded`.
 * Defaults to `type="button"`. `disabledReason` and `busy` are the two disabled states that say
 * more than a plain `disabled`, which keeps its half-opacity look; `busy="Saving"` also swaps the
 * label. `ref` reaches the `<button>` or the `<a>`. `href` makes it a link instead,
 * with the same look (the app's router link through `LinkProvider` for an in-app path, else a plain
 * `<a>`; `external` opens a new tab).
 */
export function Button(props: ButtonProps): ReactElement {
  return isLink(props) ? <LinkButton {...props} /> : <PlainButton {...props} />;
}

/** The icon, the label and the count chip: what a Button holds. */
function content(icon: IconName | undefined, size: Size, label: ReactNode): ReactNode {
  if (icon === undefined) return label;
  return (
    <>
      <Icon name={icon} size={size} />
      {label}
    </>
  );
}

function LinkButton({
  variant = "primary",
  size,
  tone = "neutral",
  icon,
  href,
  external = false,
  count,
  children,
  ...rest
}: ButtonAsLink): ReactElement {
  const drawn = useDensity(size);
  const step = useTypeStep();
  return renderLink({
    ...rest,
    href,
    external,
    className: buttonClass(variant, { size: drawn, tone }, step),
    children: content(icon, drawn, withCount(children, count)),
  });
}

function PlainButton({
  variant,
  size,
  tone,
  icon,
  disabledReason,
  busy = false,
  pressed,
  count,
  children,
  title,
  disabled,
  ...rest
}: ButtonAsButton): ReactElement {
  const drawn = useDensity(size);
  const step = useTypeStep();
  const working = Boolean(busy);
  const state = stateOf(working, disabledReason);
  const blocked = state === "blocked";
  const label = working && typeof busy === "string" ? busy : withCount(children, count);
  return (
    <Tipped text={blocked ? disabledReason : undefined} describes tap own={{ ...rest, title }}>
      {(tip) => (
        <button
          type="button"
          className={stateClass({ variant, size: drawn, tone }, state, pressed, step)}
          disabled={disabled || working}
          aria-busy={working || undefined}
          aria-pressed={pressed}
          {...rest}
          {...tip}
          {...(blocked ? blockedProps() : {})}
        >
          {content(icon, drawn, label)}
        </button>
      )}
    </Tipped>
  );
}
