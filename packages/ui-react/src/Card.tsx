import { type ComponentPropsWithoutRef, type ReactElement, type ReactNode, useId } from "react";
import { TONE_SURFACE } from "./Callout.js";
import type { Tone } from "./tone.js";
import { CardBadge } from "./CardBadge.js";
import { BODY_PAD, cardBody } from "./CardBody.js";
import { InCard } from "./cardContext.js";
import { CardFooter } from "./CardParts.js";
import { cx, focusRing, liftInteractive } from "./cx.js";
import { DensityProvider } from "./density.js";
import { type HeadingLevel, HeadingLevelProvider, useHeadingLevel } from "./headingLevel.js";
import type { IconName } from "./icons.js";
import { renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import { GapProvider } from "./stackGap.js";
import type { Size } from "./size.js";

/** A card with a `footer`. */
function withFooter(form: ReturnType<typeof cardForm>, footer: ReactNode) {
  return { ...form, footer: Boolean(footer) };
}

/** A mark needs the padded body above a heading, so it has no place in a strip or a flush card. */
function paddedIcon(
  asked: { flush?: boolean | undefined; icon?: IconName | undefined },
  bar: boolean,
) {
  return bar || asked.flush ? undefined : asked.icon;
}

/** `bar` needs a title or actions to fill it and has no tone. */
function cardForm(
  asked: {
    flush?: boolean | undefined;
    bar?: boolean | undefined;
    tone?: Tone | undefined;
    attention?: boolean | undefined;
    icon?: IconName | undefined;
    fill?: boolean | undefined;
    size: Size;
  },
  hasHeader: boolean,
) {
  const bar = (asked.bar ?? false) && hasHeader;
  return {
    flush: asked.flush ?? false,
    bar,
    tone: bar ? undefined : asked.tone,
    attention: asked.attention ?? false,
    icon: paddedIcon(asked, bar),
    fill: asked.fill ?? false,
    size: asked.size,
    footer: false,
  };
}

function cardBorder(form: ReturnType<typeof cardForm>): string {
  const surface = form.tone ? TONE_SURFACE[form.tone] : "border-slate-200/70 bg-white";
  if (!form.attention) return surface;
  // The warn tone's strong edge in place of the border colour; the fill stays.
  const fill = surface.split(" ").filter((c) => c.startsWith("bg-"));
  return cx("border-amber-600", ...fill);
}

function cardPadding(form: ReturnType<typeof cardForm>): string | false {
  return !form.flush && !form.bar && !form.footer && !form.fill && BODY_PAD[form.size];
}

function cardClass(form: ReturnType<typeof cardForm>): string {
  return cx(
    "relative scroll-mt-[calc(var(--app-header,0px)+1rem)] rounded-xl border target:outline-2 target:outline-violet-600",
    liftInteractive,
    cardBorder(form),
    cardPadding(form),
    !form.tone && "shadow-sm",
    (form.flush || form.bar || form.footer || form.fill) && "overflow-hidden",
    form.fill ? "flex h-full min-h-0 flex-col" : form.footer && "flex flex-col",
  );
}

type CardBase = {
  /** The card's heading (a small uppercase label unless `titleStyle` says otherwise). It names the card, which is then a `section`. */
  title?: string;
  /**
   * The title's heading level, 2 to 6. It does not change how the title looks.
   * @default one below the heading that holds the card: 2 on the page, 3 in a `Section`
   */
  level?: HeadingLevel | undefined;
  /**
   * How the `title` is set. `overline` is the small uppercase label of a panel; `name` is the same
   * heading in sentence case and the primary ink, for a card whose title is a name (a shop, a listing,
   * an event). Count, status, actions, `bar` and `size` work the same with both.
   * @default overline
   */
  titleStyle?: "overline" | "name";
  /** A small number beside the title (how many rows the card holds). Needs a `title`. */
  count?: number;
  /** A `Pill` (or any node) directly beside the title and count, not at the far end like `actions`. Needs a `title`. */
  status?: ReactNode;
  /** Put the title, count and actions in a tinted strip above the body, edge to edge. */
  bar?: boolean;
  /** No padding and `overflow-hidden`: the body (a table, a list) fills the card. */
  flush?: boolean;
  /** A soft fill and border in the Callout's tones, for a data panel with a status. Ignored with `bar`. */
  tone?: Tone;
  /** One of the library's icons, drawn at feature size in the accent colour above the title: the mark of a feature card. Ignored with `bar` and `flush`. */
  icon?: IconName;
  /** A band across the card, edge to edge inside its padding, under the title and above the children: a `ProgressBar` or a strip of colour that runs the card's full width. */
  inset?: ReactNode;
  /** A `Pill` (or any small node) pinned in the top-right corner, over the content and inside the radius, with no change to the layout. On a card that is a link it is part of the link's name, and a link or button in it is clickable on its own. */
  badge?: ReactNode;
  /** The warn tone's strong border in place of the card's own, for the one card in a set that needs a look (a run that differed). It keeps the card's fill. Name why in the card too (a `Pill` in `badge`, or the body); the border alone says nothing to a screen reader. */
  attention?: boolean;
  /**
   * `sm` is dense padding on the body, heading and bar, and makes a `Button`, `IconButton` or `Pill`
   * inside with no `size` of its own `sm` too; `lg` is one step roomier than `md`.
   * @default md
   */
  size?: Size;
  children: ReactNode;
};

type CardPanelProps = CardBase & {
  /** Buttons or links at the end of the header: in the strip with `bar`, else beside the title. */
  actions?: ReactNode;
  /** A tinted strip across the bottom of the card, under a hairline, for the card's own actions or a total. It stays at the foot when the card is stretched in a `CardGrid`. */
  footer?: ReactNode;
  /** Take the parent's full height: the title or bar stays put and the body scrolls. The parent sets the height. */
  fill?: boolean;
  /**
   * `article` for a card that stands alone as a piece of content (a post, a listing). Left out, a
   * titled card is a `section` named by its title, one with only an `aria-label` a `section` named
   * by that, and any other a `div`. Not on a card that is a link.
   */
  as?: "article" | undefined;
  href?: undefined;
  external?: undefined;
} & Omit<ComponentPropsWithoutRef<"section">, "title" | "className" | "style" | "children">;

type CardLinkProps = CardBase & {
  actions?: undefined;
  footer?: undefined;
  fill?: undefined;
  as?: undefined;
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  /**
   * Makes the whole card one link to this URL, with no `actions`, `footer` or `as`; an in-app path
   * goes through the app's `LinkProvider`.
   */
  href: string;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "title" | "children">>;

function isCardLink(props: CardPanelProps | CardLinkProps): props is CardLinkProps {
  return props.href !== undefined;
}

/**
 * A bordered panel with an optional title, count and status. A titled card is a `section` named by
 * its title, one with only an `aria-label` a `section` too, any other a `div`, and `as="article"` makes it an `article`. Two opt-in forms
 * for data views: `flush` drops the padding and clips the corners, for a table that runs edge to
 * edge; `bar` puts the title, count and `actions` in a tinted strip across the top, over the body.
 * A flush card has no padding for a `title`, so give it a `bar`. An empty state is an `EmptyState`,
 * which draws its own dashed frame. Inside a card a `Stack` is `xs` apart, and the title's
 * heading level is one below the heading that holds the card. `size="sm"` is the dense padding and `size="lg"` the
 * roomy one, the same on a `ListRow` and a `FileDrop`. `tone` is the Callout's set, for a data panel that carries a status
 * (a soft fill and border, no shadow); a message is still a `Callout`, and `bar` has no tone. A
 * titled panel is named by its title: the root gets
 * `aria-labelledby` pointing at the heading, unless the caller passes its own `aria-label` or
 * `aria-labelledby`, which wins. Other props (`id`, `data-*`, `aria-*`) go on the root. The root is `relative`, so a
 * `TextLink stretch` inside it covers the card. A card with an `id` is an anchor target: `#id`
 * scrolls it clear of the sticky header (and a `subnav`) and outlines it in the accent colour while
 * it is the target.
 *
 * `icon` is one of the library's icons at feature size in the accent colour, above the title: the
 * mark of a feature card. It sits in the padded body, so `bar` and `flush` have none.
 *
 * `footer` is a tinted strip across the bottom, under a hairline, for the card's own actions or a
 * total; in a `CardGrid` it stays at the foot of a card that is stretched to the row's height. It
 * suits a panel, not a card that is a link.
 *
 * `fill` makes a panel take its parent's full height (the parent sets it): the title or bar stays
 * put and the body scrolls. Not on a link card.
 *
 * `href` makes the whole card one link: a hover border and the focus ring, with the link stretched
 * over the card, so it takes no `actions`, `footer` or `as`. A `TextLink`, `Button` or `Checkbox` in
 * the body sits above the link and is clickable on its own. An in-app `href` is drawn by the app's
 * router link through `LinkProvider`. `external` opens it in a new tab. On a link card
 * `id`, `data-*` and the describing `aria-*` (`aria-describedby`, `aria-details`, …) go on the card
 * root, not the link; the link's own `aria-label`, `aria-labelledby` and `aria-current` stay on the
 * link. The link is named by the card's text (title, body, `badge`) through the root's id, which is
 * generated when the caller gives none.
 */
export function Card(props: CardPanelProps | CardLinkProps): ReactElement {
  const level = useHeadingLevel(props.level);
  return (
    <InCard>
      <GapProvider gap="xs">
        <DensityProvider size={props.size === "sm" ? "sm" : null}>
          {props.title ? (
            <HeadingLevelProvider level={level}>{cardOf(props, level)}</HeadingLevelProvider>
          ) : (
            cardOf(props, level)
          )}
        </DensityProvider>
      </GapProvider>
    </InCard>
  );
}

/** Whether a caller named the card: a card with a name is a section, as a plain div may carry no `aria-label`. */
function hasOwnName(rest: {
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
}) {
  return rest["aria-label"] !== undefined || rest["aria-labelledby"] !== undefined;
}

/** The card in its form, its title at `level`. An untitled card adds no heading, so what is inside keeps the level of what holds it. */
function cardOf(props: CardPanelProps | CardLinkProps, level: HeadingLevel): ReactElement {
  return isCardLink(props) ? (
    <LinkCard {...props} level={level} />
  ) : (
    <PanelCard {...props} level={level} />
  );
}

/** A card that is not a link: a `section` named by its heading, a `div` without one, or an `article`. */
function PanelCard(props: CardPanelProps & { level: HeadingLevel }): ReactElement {
  const {
    title,
    titleStyle,
    count,
    status,
    actions,
    footer,
    bar,
    flush,
    tone,
    badge,
    inset,
    attention,
    icon,
    fill,
    size = "md",
    level,
    children,
    ...panel
  } = props;
  const { as, ...rest } = panel;
  const labelled = hasOwnName(rest);
  const Tag = as ?? (title || labelled ? "section" : "div");
  const headingId = useId();
  const form = withFooter(
    cardForm({ flush, bar, tone, attention, icon, fill, size }, Boolean(title || actions)),
    footer,
  );
  // The title names the card; a caller's own name wins.
  const named = title && !labelled;
  return (
    <Tag {...(named ? { "aria-labelledby": headingId } : {})} {...rest} className={cardClass(form)}>
      {cardBody(form, {
        title,
        titleStyle,
        level,
        count,
        status,
        actions,
        inset,
        children,
        headingId,
      })}
      {form.footer && <CardFooter size={form.size}>{footer}</CardFooter>}
      {badge && <CardBadge size={form.size}>{badge}</CardBadge>}
    </Tag>
  );
}

/** What names or marks the link itself: these stay on the overlay `<a>`; `id`, `data-*` and every other `aria-*` go on the card. */
const LINK_OWN = new Set(["aria-label", "aria-labelledby", "aria-current"]);

/** Splits a link card's props into the attributes for the root and the rest, for the `<a>`. */
function splitRootAttrs(props: object): [Record<string, unknown>, Record<string, unknown>] {
  const root: Record<string, unknown> = {};
  const link: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    const onRoot =
      key === "id" || key.startsWith("data-") || (key.startsWith("aria-") && !LINK_OWN.has(key));
    (onRoot ? root : link)[key] = value;
  }
  return [root, link];
}

/** A card that is a link: a `div` with the link stretched over it as an empty overlay, so the card's own links and buttons are not nested in it. */
function LinkCard(props: CardLinkProps & { level: HeadingLevel }): ReactElement {
  const {
    title,
    titleStyle,
    count,
    status,
    actions,
    bar,
    flush,
    tone,
    badge,
    inset,
    attention,
    icon,
    size = "md",
    level,
    children,
    external = false,
    href,
    ...rest
  } = props;
  const form = cardForm({ flush, bar, tone, attention, icon, size }, Boolean(title));
  const generated = useId();
  const [root, link] = splitRootAttrs(rest);
  // The link is named by the whole card, so the root needs an id: the caller's, else a generated one.
  const cardId = typeof root["id"] === "string" ? root["id"] : generated;
  return (
    <div
      {...root}
      id={cardId}
      className={cx(cardClass(form), "transition hover:border-violet-400")}
    >
      {renderLink({
        ...(link["aria-label"] === undefined ? { "aria-labelledby": cardId } : {}),
        ...link,
        href,
        external,
        className: cx(
          "link-stretch absolute inset-0 rounded-xl",
          focusRing,
          "focus-visible:-outline-offset-2",
        ),
        children: null,
      })}
      {cardBody(form, {
        title,
        titleStyle,
        level,
        count,
        status,
        actions,
        inset,
        children,
        headingId: undefined,
      })}
      {badge && <CardBadge size={form.size}>{badge}</CardBadge>}
    </div>
  );
}
