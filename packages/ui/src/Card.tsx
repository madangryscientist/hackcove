import { type ComponentPropsWithoutRef, type ReactElement, type ReactNode, useId } from "react";
import { type CalloutTone, TONE_SURFACE } from "./Callout.js";
import { cx, focusRing, liftInteractive } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

/** The space under a card's heading, by `size`. */
const HEADING_GAP: Record<Size, string> = { sm: "mb-2", md: "mb-3", lg: "mb-4" };

/** The padding of a card's bar and footer strips, by `size`. */
const STRIP_PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-5 py-3", lg: "px-6 py-4" };

function CardHeading({
  title,
  count,
  status,
  bar,
  spaced,
  size,
}: {
  title: string;
  count: number | undefined;
  status: ReactNode;
  bar: boolean;
  spaced: boolean;
  size: Size;
}) {
  const ink = bar ? "text-slate-500" : "text-slate-400";
  return (
    <div
      className={cx(
        "flex gap-2",
        status ? "items-center" : "items-baseline",
        spaced && HEADING_GAP[size],
      )}
    >
      <h2 className={cx("text-xs font-semibold uppercase tracking-wide", ink)}>{title}</h2>
      {count !== undefined && <span className={cx("text-xs font-medium", ink)}>{count}</span>}
      {status}
    </div>
  );
}

function CardActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}

function CardBar({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: Size;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50",
        STRIP_PAD[size],
      )}
    >
      {heading}
      {actions && <CardActions>{actions}</CardActions>}
    </div>
  );
}

function CardFooter({ children, size }: { children: ReactNode; size: Size }) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-200/70 bg-slate-50 [&>[data-button-group]]:grow",
        STRIP_PAD[size],
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: Size;
}) {
  if (!actions) return heading;
  return (
    <div className={cx("flex items-center justify-between gap-3", HEADING_GAP[size])}>
      {heading}
      <CardActions>{actions}</CardActions>
    </div>
  );
}

/** A card with a `footer`: a `dashed` card stands alone and has none. */
function withFooter(form: ReturnType<typeof cardForm>, footer: ReactNode) {
  return { ...form, footer: !form.dashed && Boolean(footer) };
}

/** `dashed` stands alone; `bar` needs a title or actions to fill it and has no tone. */
function cardForm(
  asked: {
    flush?: boolean | undefined;
    bar?: boolean | undefined;
    dashed?: boolean | "filled" | undefined;
    tone?: CalloutTone | undefined;
    size: Size;
  },
  hasHeader: boolean,
) {
  const dashed = Boolean(asked.dashed);
  const bar = (asked.bar ?? false) && !dashed && hasHeader;
  return {
    flush: (asked.flush ?? false) && !dashed,
    bar,
    dashed,
    filled: asked.dashed === "filled",
    tone: dashed || bar ? undefined : asked.tone,
    size: asked.size,
    footer: false,
  };
}

/** The padding of a card's body by `size`. */
const BODY_PAD: Record<Size, string> = { sm: "p-3", md: "p-5", lg: "p-6" };

function cardBorder(form: ReturnType<typeof cardForm>): string {
  if (form.dashed) return "border-dashed border-slate-300";
  return form.tone ? TONE_SURFACE[form.tone] : "border-slate-200/70 bg-white";
}

function cardPadding(form: ReturnType<typeof cardForm>): string | false {
  if (form.dashed) {
    return cx(form.filled ? "p-10" : "p-8", "text-center text-sm text-slate-500");
  }
  return !form.flush && !form.bar && !form.footer && BODY_PAD[form.size];
}

function cardClass(form: ReturnType<typeof cardForm>): string {
  return cx(
    "relative scroll-mt-28 rounded-xl border target:outline-2 target:outline-violet-600",
    liftInteractive,
    cardBorder(form),
    form.filled && "bg-white",
    cardPadding(form),
    !form.dashed && !form.tone && "shadow-sm",
    (form.flush || form.bar || form.footer) && "overflow-hidden",
    form.footer && "flex flex-col",
  );
}

type CardBase = {
  title?: string;
  count?: number;
  /** A `Pill` (or any node) directly beside the title and count, not at the far end like `actions`. Needs a `title`. */
  status?: ReactNode;
  /** Put the title, count and actions in a tinted strip above the body, edge to edge. */
  bar?: boolean;
  /** No padding and `overflow-hidden`: the body (a table, a list) fills the card. */
  flush?: boolean;
  /** An empty-state shell: dashed outline, no shadow, no fill, centred muted text. `"filled"` puts it on a surface fill with more padding. */
  dashed?: boolean | "filled";
  /** A soft fill and border in the Callout's tones, for a data panel with a status. Ignored with `bar` and `dashed`. */
  tone?: CalloutTone;
  /**
   * `sm` is dense padding on the body, heading and bar, `lg` one step roomier than `md`; a
   * `dashed` shell keeps its own.
   * @default md
   */
  size?: Size;
  children: ReactNode;
};

type CardPanelProps = CardBase & {
  /** Buttons or links at the end of the header: in the strip with `bar`, else beside the title. */
  actions?: ReactNode;
  /** A tinted strip across the bottom of the card, under a hairline, for the card's own actions or a total. It stays at the foot when the card is stretched in a `CardGrid`. Ignored with `dashed`. */
  footer?: ReactNode;
  as?: "section" | "article" | "div";
  href?: undefined;
  render?: undefined;
  external?: undefined;
} & Omit<ComponentPropsWithoutRef<"section">, "title" | "className" | "style" | "children">;

type CardLinkProps = CardBase & {
  /** A card that is a link has nothing else to click: no `actions`. */
  actions?: undefined;
  /** A card that is a link has nothing else to click: no `footer`. */
  footer?: undefined;
  /** A card that is a link is the link: no `as`. */
  as?: undefined;
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "title" | "children">> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

function isCardLink(props: CardPanelProps | CardLinkProps): props is CardLinkProps {
  return props.href !== undefined || props.render !== undefined;
}

/**
 * A bordered panel with an optional title, count and status; `as` picks the element (default `section`).
 * Three opt-in forms for data views: `flush` drops the padding and clips the corners, for a table
 * that runs edge to edge; `bar` puts the title, count and `actions` in a tinted strip across the
 * top, over the body; `dashed` is an empty-state shell, a dashed outline with centred muted text.
 * `dashed` stands alone: it ignores `flush` and `bar`; `dashed="filled"` is the same shell on a
 * surface fill with more padding, for an empty state that must read as a panel. A flush card has no
 * padding for a `title`, so give it a `bar`. `size="sm"` is the dense padding and `size="lg"` the
 * roomy one, the same on a `ListRow` and a `FileDrop`. `tone` is the Callout's set, for a data panel that carries a status
 * (a soft fill and border, no shadow); a message is still a `Callout`, and `bar` and `dashed` have
 * no tone. Other props (`id`, `data-*`, `aria-*`) go on the root. The root is `relative`, so a
 * `TextLink stretch` inside it covers the card. A card with an `id` is an anchor target: `#id`
 * scrolls it clear of the sticky header (and a `subnav`) and outlines it in the accent colour while
 * it is the target.
 *
 * `footer` is a tinted strip across the bottom, under a hairline, for the card's own actions or a
 * total; in a `CardGrid` it stays at the foot of a card that is stretched to the row's height. It
 * suits a panel, not a card that is a link, and `dashed` has none.
 *
 * `href` makes the whole card one link: a hover border and the focus ring, with the link stretched
 * over the card, so it takes no `actions`, `footer` or `as`. A `TextLink`, `Button` or `Checkbox` in
 * the body sits above the link and is clickable on its own. With `render` it draws the app's own router `<Link>`
 * (`render={(p) => <Link to="/shots/1" {...p} />}`). `external` opens it in a new tab.
 */
export function Card(props: CardPanelProps | CardLinkProps): ReactElement {
  if (isCardLink(props)) return <LinkCard {...props} />;
  const {
    title,
    count,
    status,
    actions,
    footer,
    bar,
    flush,
    dashed,
    tone,
    size = "md",
    children,
    ...panel
  } = props;
  const { as: Tag = "section", ...rest } = panel;
  const form = withFooter(
    cardForm({ flush, bar, dashed, tone, size }, Boolean(title || actions)),
    footer,
  );
  return (
    <Tag {...rest} className={cardClass(form)}>
      {cardBody(form, { title, count, status, actions, children })}
      {form.footer && <CardFooter size={form.size}>{footer}</CardFooter>}
    </Tag>
  );
}

/** A card that is a link: a `div` with the link stretched over it as an empty overlay, so the card's own links and buttons are not nested in it. */
function LinkCard(props: CardLinkProps): ReactElement {
  const {
    title,
    count,
    status,
    actions,
    bar,
    flush,
    dashed,
    tone,
    size = "md",
    children,
    ...link
  } = props;
  const form = cardForm({ flush, bar, dashed, tone, size }, Boolean(title));
  const cardId = useId();
  return (
    <div id={cardId} className={cx(cardClass(form), "transition hover:border-violet-400")}>
      {renderLink({
        ...(link["aria-label"] === undefined ? { "aria-labelledby": cardId } : {}),
        ...link,
        external: link.external ?? false,
        className: cx(
          "link-stretch absolute inset-0 rounded-xl",
          focusRing,
          "focus-visible:-outline-offset-2",
        ),
        children: null,
      })}
      {cardBody(form, { title, count, status, actions, children })}
    </div>
  );
}

function cardBody(
  form: ReturnType<typeof cardForm>,
  {
    title,
    count,
    status,
    actions,
    children,
  }: {
    title: string | undefined;
    count: number | undefined;
    status: ReactNode;
    actions: ReactNode;
    children: ReactNode;
  },
): ReactNode {
  const heading = title && (
    <CardHeading
      title={title}
      count={count}
      status={status}
      bar={form.bar}
      spaced={!form.bar && !actions}
      size={form.size}
    />
  );
  const grow = form.footer && "flex-1";
  if (form.bar) {
    return (
      <>
        <CardBar heading={heading} actions={actions} size={form.size} />
        <div className={cx(grow, !form.flush && BODY_PAD[form.size]) || undefined}>{children}</div>
      </>
    );
  }
  const content = (
    <>
      <CardHeader heading={heading} actions={actions} size={form.size} />
      {children}
    </>
  );
  // With a footer the root has no padding, so the body pads itself and takes the room left over.
  return form.footer ? (
    <div className={cx(grow, !form.flush && BODY_PAD[form.size])}>{content}</div>
  ) : (
    content
  );
}
