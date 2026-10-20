import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/* ---------------------------------------------------------------------------
   Typography system
   ---------------------------------------------------------------------------
   Semantic text components that each PIN a size + weight + a default colour, so
   text can never accidentally inherit the wrong weight/scale. Mirrors the
   @cue/elements typography pattern, adapted to this stack (Tailwind v4 +
   Catppuccin Mocha).

   Colour axis — the `color` prop maps to Tailwind's slate utilities, which
   theme.css remaps to the real Catppuccin Mocha tokens in dark mode (so these
   stay consistent with the rest of the system rather than inventing a parallel
   palette). In dark mode they resolve to:
     default   → text-slate-900 → #cdd6f4  (Catppuccin `text`)
     secondary → text-slate-600 → #bac2de  (Catppuccin `subtext1`)
     tertiary  → text-slate-500 → #a6adc8  (Catppuccin `subtext0`)
     muted     → text-slate-400 → #9399b2  (Catppuccin `overlay2`)
     brand     → text-violet-600 → #cba6f7 (Catppuccin `mauve` — the accent)

   Element axis — every component has a semantic default element; the `as` prop
   overrides it (type-safe: the extra props follow the element you pass).

   Inline vs block — the inline-role components (Body, BodyStrong, Overline,
   Caption) default to `<span>` so they compose inside a sentence/flex row
   ("inline-by-default for inline roles", per the Cue pattern). The structural
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

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Own props shared by every typography component; the rest follow the rendered element. */
type OwnProps = {
  /** Colour token; each component sets a sensible default. */
  color?: TypographyColor;
  className?: string;
  children?: ReactNode;
};

/** Polymorphic props: own props + `as` + the intrinsic props of whichever element `as` selects. */
export type TypographyProps<E extends ElementType> = OwnProps & { as?: E } & Omit<
    ComponentPropsWithoutRef<E>,
    keyof OwnProps | "as"
  >;

/**
 * Build a semantic component that pins `variantClass` (size + weight + tracking)
 * and a default colour. The scale/weight for each role therefore lives in exactly
 * one place (the call below), and callers can only vary the colour, element, and
 * layout classes — never the pinned size/weight.
 */
function typography<D extends ElementType>(
  displayName: string,
  defaultAs: D,
  variantClass: string,
  defaultColor: TypographyColor,
) {
  function Typography<E extends ElementType = D>({
    as,
    color,
    className,
    children,
    ...rest
  }: TypographyProps<E>) {
    const Tag: ElementType = as ?? defaultAs;
    return (
      <Tag className={cx(variantClass, COLOR[color ?? defaultColor], className)} {...rest}>
        {children}
      </Tag>
    );
  }
  Typography.displayName = displayName;
  return Typography;
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

/** Top-level section header. `h2`, text-base/6 semibold, primary text. */
export const SectionHeading = typography(
  "SectionHeading",
  "h2",
  "text-base/6 font-semibold",
  "default",
);

/** Nested header. `h3`, text-sm/5 semibold, primary text. */
export const SubsectionHeading = typography(
  "SubsectionHeading",
  "h3",
  "text-sm/5 font-semibold",
  "default",
);

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

/** Small all-caps label above a group. `span`, text-xs semibold uppercase, tertiary. */
export const Overline = typography(
  "Overline",
  "span",
  "text-xs font-semibold uppercase tracking-wide",
  "tertiary",
);

/** Default running text. `span` (inline; `as="p"` for a paragraph), text-sm/5 normal, secondary. */
export const Body = typography("Body", "span", "text-sm/5 font-normal", "secondary");

/** Emphasised run of body text. `span`, text-sm/5 medium, primary text. */
export const BodyStrong = typography("BodyStrong", "span", "text-sm/5 font-medium", "default");

/** Fine print / metadata. `span` (inline; `as="p"` for a block), text-xs/4 normal, tertiary. */
export const Caption = typography("Caption", "span", "text-xs/4 font-normal", "tertiary");
