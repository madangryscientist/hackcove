import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";

/* ---------------------------------------------------------------------------
   Typography system
   ---------------------------------------------------------------------------
   Semantic text components that each PIN a size + weight + a default colour, so
   text can never accidentally inherit the wrong weight/scale. Written for
   this stack (Tailwind v4 + Catppuccin Mocha).

   Colour axis — the `color` prop maps to Tailwind's slate utilities, which
   theme.css remaps to the real Catppuccin Mocha tokens in dark mode (so these
   stay consistent with the rest of the system rather than inventing a parallel
   palette). In dark mode they resolve to:
     default   → text-slate-900 → #cdd6f4  (Catppuccin `text`)
     secondary → text-slate-600 → #bac2de  (Catppuccin `subtext1`)
     tertiary  → text-slate-500 → #a6adc8  (Catppuccin `subtext0`)
     muted     → text-slate-400 → #9399b2  (Catppuccin `overlay2`)
     brand     → text-violet-600 → #cba6f7 (Catppuccin `mauve` — the accent)

   Meaning axis — the inline roles (Body, BodyStrong, Caption, Overline) also take `tone`
   (muted | positive | warn | danger | info), which wins over `color`, and the closed switches
   `numeric`, `mono` and `truncate`.

   Element axis — every component has a semantic default element; the `as` prop
   overrides it (type-safe: the extra props follow the element you pass).

   Inline vs block — the inline-role components (Body, BodyStrong, Overline,
   Caption) default to `<span>` so they compose inside a sentence/flex row
   (inline by default for inline roles). The structural
   roles (PageHeading, SectionHeading, SubsectionHeading, ModalHeading,
   Subtitle) default to block elements (h1/h2/h3/p). Pass `as="p"` (etc.) to
   turn an inline role into a block.
   --------------------------------------------------------------------------- */

export type TypographyColor = "default" | "secondary" | "tertiary" | "muted" | "brand";

/** Colour token → slate/violet utility (remapped to Catppuccin Mocha in dark mode by theme.css). */
const COLOR: Record<TypographyColor, string> = {
  default: "text-slate-900", // Catppuccin text     #cdd6f4
  secondary: "text-slate-600", // Catppuccin subtext1 #bac2de
  tertiary: "text-slate-500", // Catppuccin subtext0 #a6adc8
  muted: "text-slate-400", // Catppuccin overlay2 #9399b2
  brand: "text-violet-600", // Catppuccin mauve    #cba6f7
};

/**
 * The meaning of a run of inline text: the muted tone plus the Callout's, for "Saved." or an error
 * message. Colour alone does not say it, so the words do too. Same names and text colours as a
 * `Table` cell's `tone`.
 */
export type TextTone = "muted" | "positive" | "warn" | "danger" | "info";

/** Tone → text utility. Shared with `Table`'s cell tones, so the two never drift. */
export const TEXT_TONE: Record<TextTone, string> = {
  muted: "text-slate-500",
  info: "text-blue-700",
  positive: "text-emerald-700",
  warn: "text-amber-700",
  danger: "text-red-700",
};

/** Own props shared by every typography component; the rest follow the rendered element. */
type OwnProps = {
  /** Colour token; each component sets a sensible default. */
  color?: TypographyColor;
  children?: ReactNode;
};

/** The opt-in props of the inline roles (`Body`, `BodyStrong`, `Caption`, `Overline`). */
type InlineOwnProps = {
  /** A meaning's colour (see `TextTone`). Wins over `color`. */
  tone?: TextTone | undefined;
  /** Tabular figures, so a column of amounts lines up. */
  numeric?: boolean | undefined;
  /** The monospace face, for an id, a path or a command. */
  mono?: boolean | undefined;
  /** One line, cut with an ellipsis where the container ends; the full text is the `title`. */
  truncate?: boolean | undefined;
};

type Own = OwnProps & InlineOwnProps;

/** Polymorphic props: own props + `as` + the intrinsic props of whichever element `as` selects. */
export type TypographyProps<E extends ElementType> = OwnProps & { as?: E } & Omit<
    ComponentPropsWithoutRef<E>,
    keyof OwnProps | "as" | "className" | "style"
  >;

/** The props of an inline role: `TypographyProps` plus `tone`, `numeric`, `mono` and `truncate`. */
export type InlineTypographyProps<E extends ElementType> = InlineOwnProps &
  Omit<TypographyProps<E>, keyof InlineOwnProps>;

/**
 * Build a semantic component that pins `variantClass` (size + weight + tracking)
 * and a default colour. The scale/weight for each role therefore lives in exactly
 * one place (the call below), and callers can only vary the colour and the element —
 * never the pinned size/weight, and never with a class.
 */
function typography<D extends ElementType>(
  displayName: string,
  defaultAs: D,
  variantClass: string,
  defaultColor: TypographyColor,
) {
  function Typography<E extends ElementType = D>(props: TypographyProps<E>) {
    return pinned(defaultAs, variantClass, defaultColor, props);
  }
  Typography.displayName = displayName;
  return Typography;
}

/** `typography` for the inline roles, which also take `tone`, `numeric`, `mono` and `truncate`. */
function inlineRole<D extends ElementType>(
  displayName: string,
  defaultAs: D,
  variantClass: string,
  defaultColor: TypographyColor,
) {
  function Inline<E extends ElementType = D>(props: InlineTypographyProps<E>) {
    return pinned(defaultAs, variantClass, defaultColor, props);
  }
  Inline.displayName = displayName;
  return Inline;
}

/**
 * The one place a pinned role renders. The few roles with an opt-in prop of their own are
 * written by hand, not by `typography`, and call this too.
 */
function pinned(
  defaultAs: ElementType,
  variantClass: string,
  defaultColor: TypographyColor,
  {
    as,
    color,
    tone,
    numeric,
    mono,
    truncate,
    children,
    ...rest
  }: Own & { as?: ElementType | undefined; title?: string | undefined },
): ReactElement {
  const Tag: ElementType = as ?? defaultAs;
  return (
    <Tag
      {...rest}
      {...(truncate ? { title: rest.title ?? plainText(children) } : {})}
      className={cx(
        variantClass,
        tone ? TEXT_TONE[tone] : COLOR[color ?? defaultColor],
        numeric && "tabular-nums",
        mono && "font-mono",
        truncate && "inline-block min-w-0 truncate align-bottom",
      )}
    >
      {children}
    </Tag>
  );
}

/** The text of `children` when it is all strings and numbers: what a truncated run shows on hover. */
function plainText(children: ReactNode): string | undefined {
  const parts = Children.toArray(children);
  return parts.every((part) => typeof part === "string" || typeof part === "number")
    ? parts.join("")
    : undefined;
}

// --- Structural roles (block by default) -----------------------------------

/**
 * Marketing-scale headline — the one line at the top of a public page. `h1`,
 * text-4xl/tight semibold, primary text, growing to text-6xl on wider screens.
 * `PageHeading`'s scale is deliberately dev-tool sized; a brochure
 * hero needs a display scale, so it gets its own pinned role rather than callers
 * overriding PageHeading's size.
 */
export const Display = typography(
  "Display",
  "h1",
  "text-4xl/[1.1] font-semibold tracking-tight sm:text-5xl/[1.05] lg:text-6xl/[1.05]",
  "default",
);

/** The supporting sentence under a `Display`. `p`, text-lg/7 normal, secondary. */
export const Lead = typography("Lead", "p", "text-lg/7 font-normal sm:text-xl/8", "secondary");

/** Page title. `h1`, text-2xl/8 semibold, primary text. */
export const PageHeading = typography(
  "PageHeading",
  "h1",
  "text-2xl/8 font-semibold tracking-tight",
  "default",
);

/**
 * Top-level section header. `h2`, text-base/6 semibold, primary text. `rule` sets
 * a hairline under it (the `Divider` line colour) with the space either side of
 * the line built in.
 */
export function SectionHeading<E extends ElementType = "h2">({
  rule,
  ...props
}: TypographyProps<E> & { rule?: boolean }): ReactElement {
  const variant = cx(rule && "mb-4 border-b border-slate-200/70 pb-2", "text-base/6 font-semibold");
  return pinned("h2", variant, "default", props);
}

export type SubsectionHeadingSize = "sm" | "base" | "lg";

const SUBSECTION_SIZE: Record<SubsectionHeadingSize, string> = {
  sm: "text-sm/5 font-semibold",
  base: "text-base/6 font-bold",
  lg: "text-lg/7 font-semibold",
};

/**
 * Nested header. `h3`, text-sm/5 semibold, primary text. `size` steps it up for
 * a card, drawer or form-group title: `sm` (default), `base` (bold) or `lg`. `truncate` keeps it on
 * one line and cuts it with an ellipsis where its container ends, the full text as the `title`.
 */
export function SubsectionHeading<E extends ElementType = "h3">({
  size = "sm",
  ...props
}: TypographyProps<E> & {
  size?: SubsectionHeadingSize;
  truncate?: boolean | undefined;
}): ReactElement {
  return pinned("h3", SUBSECTION_SIZE[size], "default", props);
}

/** Dialog/modal title. `h2`, text-base/6 semibold, primary text. */
export const ModalHeading = typography(
  "ModalHeading",
  "h2",
  "text-base/6 font-semibold",
  "default",
);

/** Supporting line under a heading. `p`, text-sm/5 normal, secondary. */
export const Subtitle = typography("Subtitle", "p", "text-sm/5 font-normal", "secondary");

// --- Inline roles (inline by default) --------------------------------------

/**
 * Small all-caps label above a group. `span`, text-xs semibold uppercase, tertiary. `tone`,
 * `numeric`, `mono` and `truncate` are opt-in, as on `Body`.
 */
export const Overline = inlineRole(
  "Overline",
  "span",
  "text-xs font-semibold uppercase tracking-wide",
  "tertiary",
);

/**
 * Default running text. `span` (inline; `as="p"` for a paragraph), text-sm/5 normal, secondary. A
 * block of it stops at a readable line length (`max-w-[72ch]`), wherever it sits.
 * `preserveNewlines` keeps the line breaks in the text (a user-typed note); runs of spaces still collapse.
 * `tone` colours it by meaning (`positive` for "Saved.", `danger` for an error; it wins over `color`),
 * `numeric` sets tabular figures, `mono` the monospace face, and `truncate` cuts it to one line with an
 * ellipsis (the full text becomes its `title`).
 */
export function Body<E extends ElementType = "span">({
  preserveNewlines,
  ...props
}: InlineTypographyProps<E> & { preserveNewlines?: boolean }): ReactElement {
  const variant = cx(
    preserveNewlines && "whitespace-pre-line",
    "max-w-[72ch] text-sm/5 font-normal",
  );
  return pinned("span", variant, "secondary", props);
}

/** Emphasised run of body text. `span`, text-sm/5 medium, primary text. Takes `tone`, `numeric`, `mono` and `truncate` like `Body`. */
export const BodyStrong = inlineRole("BodyStrong", "span", "text-sm/5 font-medium", "default");

/** Fine print / metadata. `span` (inline; `as="p"` for a block), text-xs/4 normal, tertiary. Takes `tone`, `numeric`, `mono` and `truncate` like `Body`. */
export const Caption = inlineRole("Caption", "span", "text-xs/4 font-normal", "tertiary");
