import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  type ElementType,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { cx } from "./cx.js";
import { useTypeStep } from "./density.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import type { Tone } from "./tone.js";

/* ---------------------------------------------------------------------------
   Typography system
   ---------------------------------------------------------------------------
   Semantic text components that each PIN a size + weight + an ink, so text can never
   accidentally inherit the wrong weight/scale. Written against Tailwind v4 utilities.

   Ink: each role has its own fixed ink (a heading the primary ink, `Text` the secondary, `Caption`
   and `Overline` the tertiary), which a theme remaps. The inline roles (Text, Caption, Overline)
   take `tone` to colour a run by meaning (`TextTone`: the library's `Tone` plus `muted` and
   `accent`), and the closed switches `numeric`, `mono`, `truncate` and `align`. Text and Caption
   add the face switches `italic` and `breakWords`; Text alone takes `strong`, `preserveNewlines`
   and `minWidth`. A heading takes no ink of its own.

   Element axis: every component has a semantic default element; the `as` prop
   overrides it (type-safe: the extra props follow the element you pass).

   Block vs inline: `Text` and `Caption` are a paragraph (`<p>`); `as="span"` is the inline form,
   for a run inside a row, a cell, a button or a sentence. `Overline` is a `<span>`. The structural
   roles (Display, Lead, PageHeading, SectionHeading, SubsectionHeading) are block elements
   (h1/h2/h3/p).
   --------------------------------------------------------------------------- */

/** A role's own ink, fixed per role. Internal: a consumer colours text by `tone`. */
type Ink = "default" | "secondary" | "tertiary" | "faint";

/** Ink → slate utility, which a theme remaps. `faint` is the quietest, for a card's bare overline. */
const INK: Record<Ink, string> = {
  default: "text-slate-900",
  secondary: "text-slate-600",
  tertiary: "text-slate-500",
  faint: "text-slate-400",
};

/**
 * The meaning of a run of inline text: the library's `Tone`, plus `muted` for a quieter line and
 * `accent` for the theme's accent ink. `neutral` (the default) is the role's own ink. Colour alone
 * does not say a meaning, so the words do too.
 */
export type TextTone = Tone | "muted" | "accent";

/** Tone → text utility, for every tone that is not the role's own ink. Shared with `Table`'s cells. */
export const TEXT_TONE: Record<Exclude<TextTone, "neutral">, string> = {
  muted: "text-slate-500",
  accent: "text-violet-600",
  info: "text-blue-700",
  positive: "text-emerald-700",
  warn: "text-amber-700",
  danger: "text-red-700",
};

/** The utility of a tone, or none for `neutral` (and no tone), which keeps the role's own ink. */
export function textToneClass(tone: TextTone | undefined): string | undefined {
  return tone === undefined || tone === "neutral" ? undefined : TEXT_TONE[tone];
}

/** Own props shared by every typography component; the rest follow the rendered element. */
type OwnProps = {
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
  /** A meaning's colour (see `TextTone`); `neutral`, the default, is the role's own ink. */
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
type TypographyProps<E extends ElementType> = OwnProps & {
  /** The element to render (each role has a semantic default); the other props follow it. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | "as" | "className" | "style" | "color">;

/**
 * The props of an inline role: `TypographyProps` plus `tone`, `numeric`, `mono` and `truncate`.
 * Spelled out like `TypographyProps`, not as an `Omit` of it, so the docs read its real types.
 */
export type InlineTypographyProps<E extends ElementType> = Own & {
  /** The element to render (each role has a semantic default); the other props follow it. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof Own | "as" | "className" | "style" | "color">;

/**
 * Build a semantic component that pins `variantClass` (size + weight + tracking)
 * and an ink. The scale/weight for each role therefore lives in exactly
 * one place (the call below), and callers can only vary the element (and, on an inline role, the
 * tone), never the pinned size, weight or ink, and never with a class.
 */
function typography<D extends ElementType>(
  displayName: string,
  defaultAs: D,
  variantClass: string,
  ink: Ink,
) {
  function Typography<E extends ElementType = D>(props: TypographyProps<E>) {
    return pinned(defaultAs, variantClass, ink, props);
  }
  Typography.displayName = displayName;
  return Typography;
}

/** `typography` for the inline roles, which also take `tone`, `numeric`, `mono` and `truncate`. */
function inlineRole<D extends ElementType>(
  displayName: string,
  defaultAs: D,
  variantClass: string,
  ink: Ink,
) {
  function Inline<E extends ElementType = D>(props: InlineTypographyProps<E>) {
    return pinned(defaultAs, variantClass, ink, props);
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
  ink: Ink,
  {
    as,
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
        textToneClass(tone) ?? INK[ink],
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
 * Marketing-scale headline: the one line at the top of a public page. `h1`,
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

// --- Prose: the long-form scale ---------------------------------------------

/**
 * Whether the text roles below are in a `Prose`. `Text`, `SectionHeading`, `SubsectionHeading` and
 * `Callout` read it and pick their prose size; outside a `Prose` it is false and nothing changes.
 * Internal: not exported from the package.
 */
const ProseContext = createContext(false);

/** True inside a `Prose`, where the text roles take the long-form scale. Internal. */
export function useProse(): boolean {
  return useContext(ProseContext);
}

/**
 * Sets the text roles back to the app scale around what a component renders itself (a `Dialog`, a
 * `Drawer`, an `EmptyState`), so one opened from a docs page looks as it does anywhere else.
 * Renders no element. Internal: not exported from the package.
 */
export function AppScale({ children }: { children?: ReactNode }): ReactElement {
  return <ProseContext.Provider value={false}>{children}</ProseContext.Provider>;
}

/**
 * Long-form content, for a docs page or an article. A block (`div`) that sets the long line height
 * (leading-7) on itself and puts the text roles inside it on the prose scale: `Text` text-base/7
 * (the size it is outside, on a longer line), `SectionHeading` text-2xl/8, `SubsectionHeading` `lg` text-2xl/8,
 * `md` text-xl/7 and `sm` text-base/7 (a semibold line at body size), and the box of a `Callout`
 * text-base/7. Every other role keeps its size. Nothing outside a `Prose` changes, and a `Dialog`,
 * `Drawer` or `EmptyState` inside one is back on the app scale. An app screen never uses it: wrap the
 * body of a docs page or an article, inside a `ProseLayout`, a `SidebarLayout` or anywhere else.
 */
export function Prose({ children, ...rest }: { children?: ReactNode } & Passthrough): ReactElement {
  return (
    <ProseContext.Provider value={true}>
      <div {...rest} className="leading-7">
        {children}
      </div>
    </ProseContext.Provider>
  );
}

/**
 * A role's classes on each scale: the default one, the one under an `AppShell density="compact"`
 * (one step down), and the long-form one inside a `Prose`.
 */
type Scale = { app: string; compact: string; prose: string };

const SECTION: Scale = {
  app: "text-xl/7 font-semibold",
  compact: "text-base/6 font-semibold",
  prose: "text-2xl/8 font-semibold tracking-tight",
};

/** The class of a role on the scale in force: the Prose one inside a `Prose`, else the type step's. */
function useScale(scale: Scale): string {
  const prose = useProse();
  const step = useTypeStep();
  if (prose) return scale.prose;
  return step === "compact" ? scale.compact : scale.app;
}

/** The offset an anchored heading keeps from the top, so the sticky header does not cover it. */
const SCROLL_TARGET = "scroll-mt-28";

/**
 * Top-level section header. `h2`, text-xl/7 semibold, primary text (text-base/6 under an
 * `AppShell density="compact"`, text-2xl/8 semibold tight inside a `Prose`). `rule` sets
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
  const size = useScale(SECTION);
  const hasDescription = description != null && description !== false;
  // An `id` makes the heading a link target, so an anchor jump leaves it clear of the sticky header.
  const scroll = props.id === undefined ? undefined : SCROLL_TARGET;
  if (!hasDescription) {
    return pinned("h2", cx(rule && hairline, size, scroll), "default", props);
  }
  return (
    <div className={cx("flex flex-col gap-1", rule && hairline)}>
      {pinned("h2", cx(size, scroll), "default", props)}
      <Text tone="muted">{description}</Text>
    </div>
  );
}

export type SubsectionHeadingSize = Size;

const SUBSECTION_SIZE: Record<SubsectionHeadingSize, Scale> = {
  sm: {
    app: "text-base/6 font-semibold",
    compact: "text-sm/5 font-semibold",
    prose: "text-base/7 font-semibold",
  },
  md: {
    app: "text-lg/7 font-semibold",
    compact: "text-base/6 font-semibold",
    prose: "text-xl/7 font-semibold",
  },
  lg: {
    app: "text-xl/7 font-semibold",
    compact: "text-lg/7 font-semibold",
    prose: "text-2xl/8 font-semibold tracking-tight",
  },
};

/**
 * Nested header. `h3`, text-lg/7 semibold, primary text. `size` steps it down for a dense card
 * or up for a drawer or form-group title: `sm` (text-base, body size set apart by its weight), `md`
 * (default) or `lg` (text-xl). Under an `AppShell density="compact"` each is one step down. Inside a `Prose`
 * `md` is text-xl/7 (the h3 of a doc), `sm` text-base/7 (the h4: body size, set apart by its weight)
 * and `lg` text-2xl/8, the size of a `SectionHeading` there. `truncate` keeps it on
 * one line and cuts it with an ellipsis where its container ends, the full text as the `title`.
 */
export function SubsectionHeading<E extends ElementType = "h3">({
  size = "md",
  ...props
}: TypographyProps<E> & {
  /**
   * The heading's type size: `sm` is text-base/6, `md` text-lg/7 and `lg` text-xl/7 (one step down
   * each under an `AppShell density="compact"`).
   * @default md
   */
  size?: SubsectionHeadingSize;
  /** One line, cut with an ellipsis where the container ends; the full text becomes the `title`. */
  truncate?: boolean | undefined;
}): ReactElement {
  return pinned("h3", useScale(SUBSECTION_SIZE[size]), "default", props);
}

// --- Inline roles -------------------------------------------------------------

const OVERLINE = "text-xs font-semibold uppercase tracking-wide";

/**
 * Small all-caps label above a group. `span`, text-xs semibold uppercase, tertiary. `tone`,
 * `numeric`, `mono`, `truncate` and `align` are opt-in, as on `Text`.
 */
export const Overline = inlineRole("Overline", "span", OVERLINE, "tertiary");

/**
 * A card title drawn as an `Overline`, in the tertiary ink or, bare, the faint one. Internal: the
 * inks are the card's, never a consumer's.
 */
export function CardOverline({
  faint,
  ...props
}: {
  faint: boolean;
  id?: string | undefined;
  children?: ReactNode;
}): ReactElement {
  return pinned("h2", OVERLINE, faint ? "faint" : "tertiary", props);
}

/** A fixed width for a run of text: `amount` is a money figure, right-aligned, at a width that lines a column up. */
export type TextMinWidth = "amount";

/**
 * Running text. A paragraph (`p`; `as="span"` for a run inside a row, a cell or a sentence),
 * text-base/6 normal, secondary (text-sm/5 under an `AppShell density="compact"`, text-base/7 inside
 * a `Prose`). A block of it
 * stops at a readable line length (`max-w-[72ch]`), wherever it sits. `strong` emphasises it:
 * font-medium in the primary ink, unless `tone` says otherwise.
 * `preserveNewlines` keeps the line breaks in the text (a user-typed note); runs of spaces still collapse.
 * `tone` colours it by meaning (`positive` for "Saved.", `danger` for an error, `muted` for a quieter line),
 * `numeric` sets tabular figures, `mono` the monospace face, and `truncate` cuts it to one line with an
 * ellipsis (the full text becomes its `title`). `align` sets it at `start`, `center` or `end`.
 * `italic` slants it, `breakWords` breaks a long unbroken string at the edge of its box, and `minWidth="amount"`
 * fixes a width and right-aligns the figure in it (a column of amounts lines up); it does not take `align`.
 */
export function Text<E extends ElementType = "p">({
  strong,
  preserveNewlines,
  minWidth,
  italic,
  breakWords,
  ...props
}: InlineTypographyProps<E> &
  RunOwnProps & {
    /** Emphasis: font-medium in the primary ink (`tone` still wins). */
    strong?: boolean | undefined;
    /** Keep the line breaks in the text (a user-typed note); runs of spaces still collapse. */
    preserveNewlines?: boolean;
    /** A fixed width: `amount` is a right-aligned money figure, min-w-24, in tabular figures. */
    minWidth?: TextMinWidth | undefined;
  }): ReactElement {
  const scale = useScale(TEXT);
  return pinned(
    "p",
    cx(
      textVariant(strong, preserveNewlines, true, scale),
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
 * The supporting line under a `Dialog` title: `Text` without the measure, so
 * it runs the width of its dialog. Internal; not exported from the package.
 */
export function HeaderText({ children }: { children: ReactNode }): ReactElement {
  return pinned("p", textVariant(false, false, false, useScale(TEXT)), "secondary", { children });
}

const TEXT: Scale = { app: "text-base/6", compact: "text-sm/5", prose: "text-base/7" };

function textVariant(
  strong: boolean | undefined,
  preserveNewlines: boolean | undefined,
  measure: boolean,
  size: string,
): string {
  return cx(
    preserveNewlines && "whitespace-pre-line",
    measure && "max-w-[72ch]",
    size,
    strong ? "font-medium" : "font-normal",
  );
}

/**
 * Fine print / metadata. A paragraph (`p`; `as="span"` inline), text-sm/5 normal, tertiary
 * (text-xs/4 under an `AppShell density="compact"`). Takes `tone`,
 * `numeric`, `mono`, `truncate` and `align` like `Text`, and `italic` for a muted hint and `breakWords`
 * for a long unbroken string such as a URL.
 */
export function Caption<E extends ElementType = "p">({
  italic,
  breakWords,
  ...props
}: InlineTypographyProps<E> & RunOwnProps): ReactElement {
  const size = useTypeStep() === "compact" ? "text-xs/4" : "text-sm/5";
  return pinned(
    "p",
    cx(size, "font-normal", italic && "italic", breakWords && "break-words"),
    "tertiary",
    props,
  );
}
