import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import type { Size } from "./size.js";

/* ---------------------------------------------------------------------------
   Typography system
   ---------------------------------------------------------------------------
   Semantic text components that each PIN a size + weight + a default colour, so
   text can never accidentally inherit the wrong weight/scale. Written against
   Tailwind v4 utilities.

   Colour axis — the `color` prop maps to Tailwind's slate and violet utilities,
   which a theme remaps to its own ink and accent (so these stay consistent with
   the rest of the system rather than inventing a parallel palette):
     default   → text-slate-900  (primary ink)
     secondary → text-slate-600
     tertiary  → text-slate-500
     muted     → text-slate-400
     brand     → text-violet-600 (the accent)

   Meaning axis — the inline roles (Text, Caption, Overline) also take `tone`
   (muted | positive | warn | danger | info), which wins over `color`, and the closed switches
   `numeric`, `mono`, `truncate` and `align`. Text and Caption add the face switches `italic` and
   `breakWords`; Text alone takes `strong`, `preserveNewlines` and `minWidth`.

   Element axis — every component has a semantic default element; the `as` prop
   overrides it (type-safe: the extra props follow the element you pass).

   Inline vs block — the inline-role components (Text, Overline, Caption)
   default to `<span>` so they compose inside a sentence/flex row (inline by
   default for inline roles). The structural roles (Display, Lead, PageHeading,
   SectionHeading, SubsectionHeading) default to block elements (h1/h2/h3/p).
   Pass `as="p"` (etc.) to turn an inline role into a block.
   --------------------------------------------------------------------------- */

export type TypographyColor = "default" | "secondary" | "tertiary" | "muted" | "brand";

/** Colour token → slate/violet utility, which a theme remaps. */
const COLOR: Record<TypographyColor, string> = {
  default: "text-slate-900",
  secondary: "text-slate-600",
  tertiary: "text-slate-500",
  muted: "text-slate-400",
  brand: "text-violet-600",
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

/** Where a run of text sits across its block. */
export type TextAlign = "start" | "center" | "end";

const ALIGN: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/** The opt-in props of the inline roles (`Text`, `Caption`, `Overline`). */
type InlineOwnProps = {
  /** A meaning's colour (see `TextTone`). Wins over `color`. */
  tone?: TextTone | undefined;
  /** Tabular figures, so a column of amounts lines up. */
  numeric?: boolean | undefined;
  /** The monospace face, for an id, a path or a command. */
  mono?: boolean | undefined;
  /** One line, cut with an ellipsis where the container ends; the full text is the `title`. */
  truncate?: boolean | undefined;
  /**
   * Set the text at `start`, `center` or `end` of its block. The run becomes block-level, so the
   * alignment has a box to act on (a table header cell, a right-hand column).
   */
  align?: TextAlign | undefined;
};

/** The opt-in props of `Text` and `Caption` only: the face of the run, not a label's. */
type RunOwnProps = {
  /** Italic: a muted hint or a caption. */
  italic?: boolean | undefined;
  /** Break a long unbroken string (a URL, a token) where the container ends, instead of overflowing. */
  breakWords?: boolean | undefined;
};

type Own = OwnProps & InlineOwnProps;

/** Polymorphic props: own props + `as` + the intrinsic props of whichever element `as` selects. */
export type TypographyProps<E extends ElementType> = OwnProps & {
  /** The element to render (each role has a semantic default); the other props follow it. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | "as" | "className" | "style">;

/**
 * The props of an inline role: `TypographyProps` plus `tone`, `numeric`, `mono` and `truncate`.
 * Spelled out like `TypographyProps`, not as an `Omit` of it, so the docs read its real types.
 */
export type InlineTypographyProps<E extends ElementType> = Own & {
  /** The element to render (each role has a semantic default); the other props follow it. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof Own | "as" | "className" | "style">;

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
    align,
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
        layoutClass(align, truncate),
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * The alignment, and the box it needs. An aligned run is block-level, so text-align has a box to set
 * the text in. A truncated run clips: inline-block by default, a block when it is aligned too.
 */
function layoutClass(align: TextAlign | undefined, truncate: boolean | undefined): string {
  const box = truncate
    ? cx("min-w-0 truncate align-bottom", align ? "block" : "inline-block")
    : align && "block";
  return cx(align && ALIGN[align], box);
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
 * `PageHeading` is the title of an ordinary page, a step below; a brochure hero needs a display
 * scale, so it gets its own pinned role rather than callers overriding PageHeading's size.
 */
export const Display = typography(
  "Display",
  "h1",
  "text-4xl/[1.1] font-semibold tracking-tight sm:text-5xl/[1.05] lg:text-6xl/[1.05]",
  "default",
);

/** The supporting sentence under a `Display`. `p`, text-lg/7 normal, secondary. */
export const Lead = typography("Lead", "p", "text-lg/7 font-normal sm:text-xl/8", "secondary");

/**
 * Page title. `h1`, text-3xl/9 bold (text-4xl/10 from `sm`), tight, primary text: well above the
 * `Lead` under it and the body text after it, so the page's title reads first.
 */
export const PageHeading = typography(
  "PageHeading",
  "h1",
  "text-3xl/9 font-bold tracking-tight sm:text-4xl/10",
  "default",
);

/**
 * Top-level section header. `h2`, text-base/6 semibold, primary text. `rule` sets
 * a hairline under it (the `Divider` line colour) with the space either side of
 * the line built in. `description` is a muted line under the heading, outside the `<h2>`, so the
 * heading's name stays the title; the rule then sits under the description.
 */
export function SectionHeading<E extends ElementType = "h2">({
  rule,
  description,
  ...props
}: TypographyProps<E> & {
  /** A hairline under the heading, with the space either side of it built in. */
  rule?: boolean;
  /** A muted line under the heading that says more. It is a paragraph beside the heading, not part of its name. */
  description?: ReactNode;
}): ReactElement {
  const hairline = "mb-4 border-b border-slate-200/70 pb-2";
  const hasDescription = description != null && description !== false;
  if (!hasDescription) {
    return pinned("h2", cx(rule && hairline, "text-base/6 font-semibold"), "default", props);
  }
  return (
    <div className={cx("flex flex-col gap-1", rule && hairline)}>
      {pinned("h2", "text-base/6 font-semibold", "default", props)}
      <Text as="p" color="tertiary">
        {description}
      </Text>
    </div>
  );
}

export type SubsectionHeadingSize = Size;

const SUBSECTION_SIZE: Record<SubsectionHeadingSize, string> = {
  sm: "text-sm/5 font-semibold",
  md: "text-base/6 font-semibold",
  lg: "text-lg/7 font-semibold",
};

/**
 * Nested header. `h3`, text-base/6 semibold, primary text. `size` steps it down for a dense card
 * or up for a drawer or form-group title: `sm` (text-sm), `md` (default) or `lg`. `truncate` keeps it on
 * one line and cuts it with an ellipsis where its container ends, the full text as the `title`.
 */
export function SubsectionHeading<E extends ElementType = "h3">({
  size = "md",
  ...props
}: TypographyProps<E> & {
  /**
   * The heading's type size: `sm` is text-sm/5, `md` text-base/6 and `lg` text-lg/7.
   * @default md
   */
  size?: SubsectionHeadingSize;
  /** One line, cut with an ellipsis where the container ends; the full text becomes the `title`. */
  truncate?: boolean | undefined;
}): ReactElement {
  return pinned("h3", SUBSECTION_SIZE[size], "default", props);
}

// --- Inline roles (inline by default) --------------------------------------

/**
 * Small all-caps label above a group. `span`, text-xs semibold uppercase, tertiary. `tone`,
 * `numeric`, `mono`, `truncate` and `align` are opt-in, as on `Text`.
 */
export const Overline = inlineRole(
  "Overline",
  "span",
  "text-xs font-semibold uppercase tracking-wide",
  "tertiary",
);

/** A fixed width for a run of text: `amount` is a money figure, right-aligned, at a width that lines a column up. */
export type TextMinWidth = "amount";

/**
 * Running text. `span` (inline; `as="p"` for a paragraph), text-sm/5 normal, secondary. A block of it
 * stops at a readable line length (`max-w-[72ch]`), wherever it sits. `strong` emphasises it:
 * font-medium in the primary ink, unless `color` or `tone` says otherwise.
 * `preserveNewlines` keeps the line breaks in the text (a user-typed note); runs of spaces still collapse.
 * `tone` colours it by meaning (`positive` for "Saved.", `danger` for an error; it wins over `color`),
 * `numeric` sets tabular figures, `mono` the monospace face, and `truncate` cuts it to one line with an
 * ellipsis (the full text becomes its `title`). `align` sets it at `start`, `center` or `end`.
 * `italic` slants it, `breakWords` breaks a long unbroken string at the edge of its box, and `minWidth="amount"`
 * fixes a width and right-aligns the figure in it (a column of amounts lines up); it does not take `align`.
 */
export function Text<E extends ElementType = "span">({
  strong,
  preserveNewlines,
  minWidth,
  italic,
  breakWords,
  ...props
}: InlineTypographyProps<E> &
  RunOwnProps & {
    /** Emphasis: font-medium in the primary ink (`color` and `tone` still win). */
    strong?: boolean | undefined;
    /** Keep the line breaks in the text (a user-typed note); runs of spaces still collapse. */
    preserveNewlines?: boolean;
    /** A fixed width: `amount` is a right-aligned money figure, min-w-24, in tabular figures. */
    minWidth?: TextMinWidth | undefined;
  }): ReactElement {
  return pinned(
    "span",
    cx(
      textVariant(strong, preserveNewlines, true),
      italic && "italic",
      breakWords && "break-words",
      minWidth === "amount" && "inline-block min-w-24 text-end",
    ),
    strong ? "default" : "secondary",
    // An amount is always in tabular figures, so it lines up; `numeric` already emits them.
    { ...props, numeric: props.numeric || minWidth === "amount" },
  );
}

/**
 * The supporting line under a `Dialog` title: `Text as="p"` without the measure, so
 * it runs the width of its dialog. Internal; not exported from the package.
 */
export function HeaderText({ children }: { children: ReactNode }): ReactElement {
  return pinned("p", textVariant(false, false, false), "secondary", { children });
}

function textVariant(
  strong: boolean | undefined,
  preserveNewlines: boolean | undefined,
  measure: boolean,
): string {
  return cx(
    preserveNewlines && "whitespace-pre-line",
    measure && "max-w-[72ch]",
    "text-sm/5",
    strong ? "font-medium" : "font-normal",
  );
}

/**
 * Fine print / metadata. `span` (inline; `as="p"` for a block), text-xs/4 normal, tertiary. Takes `tone`,
 * `numeric`, `mono`, `truncate` and `align` like `Text`, and `italic` for a muted hint and `breakWords`
 * for a long unbroken string such as a URL.
 */
export function Caption<E extends ElementType = "span">({
  italic,
  breakWords,
  ...props
}: InlineTypographyProps<E> & RunOwnProps): ReactElement {
  return pinned(
    "span",
    cx("text-xs/4 font-normal", italic && "italic", breakWords && "break-words"),
    "tertiary",
    props,
  );
}
