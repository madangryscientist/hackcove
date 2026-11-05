import {
  type ComponentPropsWithoutRef,
  type PointerEventHandler,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import { Chevron } from "./Chevron.js";
import { cx, focusRing, liftInteractive } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

const ROW_LOOK =
  "flex w-full items-center gap-3 text-left text-sm text-slate-900 disabled:pointer-events-none disabled:opacity-50";

const INSET_RING = `${focusRing} focus-visible:-outline-offset-2`;

const ROW = `${ROW_LOOK} ${INSET_RING}`;

/** A linked row is a `relative` box; its link is an empty overlay, so the row's own links and buttons are not nested in it. */
const LINK_ROW = `relative ${ROW_LOOK} ${liftInteractive}`;

const OVERLAY = `link-stretch absolute inset-0 ${INSET_RING}`;

const STATIC = "group/row flex w-full items-center gap-3 text-sm text-slate-900";

/**
 * A static row with `detail`: the row's own line (the label, `trailing`, `actions`) over the detail,
 * `leading` in a column of its own beside both, so the detail starts where the label does.
 */
const STATIC_DETAIL = "group/row grid w-full items-center gap-3 text-sm text-slate-900";
const DETAIL_COLUMNS = {
  withLeading: "grid-cols-[auto_minmax(0,1fr)]",
  alone: "grid-cols-[minmax(0,1fr)]",
};

const FILL = "hover:bg-slate-50";
const SELECTED = "bg-violet-50 hover:bg-violet-50";
/**
 * The row a pointer or keyboard cursor is on: the inset fill, one step deeper than hover, so it
 * still shows on a `bg-slate-50` surface (a `FullBleedLayout` panel, a toned card).
 */
const ACTIVE = "bg-slate-100";

/** The keyboard cursor: the focus ring, drawn inside the row, on a row that does not hold DOM focus. */
const FOCUSED = "outline-2 -outline-offset-2 outline-violet-600";

/** A thumbnail's width. A direct-child image fills it. */
const THUMBNAIL = "block w-32 [&>img]:block [&>img]:h-auto [&>img]:w-full";

/** Hidden until the row is hovered or has focus inside it; always shown where any pointer is coarse (a touch screen, hybrids included). */
const REVEAL =
  "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 any-pointer-coarse:opacity-100";

const PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-4 py-3", lg: "px-5 py-4" };

type Shared = {
  /**
   * `sm` is dense padding, `lg` one step roomier than `md`.
   * @default md
   */
  size?: Size | undefined;
  /** A hairline above the row: set it on every row after the first. */
  divided?: boolean | undefined;
  /** Content before the label: an Avatar, a thumbnail, an icon. */
  leading?: ReactNode | undefined;
  /** A second, muted line under the label (a date, a note), like `TableCell`'s `secondary`. */
  secondary?: ReactNode | undefined;
  /** Content at the far end of the row: a value, a count, a Pill. */
  trailing?: ReactNode | undefined;
  /**
   * Marks the row in view, the one whose detail is open: a violet fill and `aria-current="true"`.
   * Set it on one row of a list.
   */
  selected?: boolean | undefined;
  /**
   * Marks the row the keyboard cursor is on, for a list moved with the arrow keys or `j`/`k` while
   * focus stays on the list: the focus ring, drawn inside the row. It says nothing to a screen
   * reader (move real focus for that) and combines with `selected`.
   */
  focused?: boolean | undefined;
  /**
   * Marks the row a list follows with the pointer and the keyboard alike (set it from
   * `onPointerEnter` and `onFocus`): a fill one step deeper than hover, so it shows on a white card
   * and on a tinted panel alike. On a static row it shows the fill without `revealOnHover`, and
   * shows `actions` that `revealOnHover` hides. `selected` wins.
   */
  active?: boolean | undefined;
  /**
   * A fixed width for `leading`, for a thumbnail (an `<img>` fills it), so the labels of rows with
   * and without a picture still line up. Without it `leading` is as wide as its content.
   */
  leadingWidth?: "thumbnail" | undefined;
  children: ReactNode;
};

type NotStatic = {
  static?: undefined;
  actions?: undefined;
  revealOnHover?: undefined;
  detail?: undefined;
};

type ListRowButtonProps = Shared &
  NotStatic & {
    /**
     * Makes the row a collapsible header: sets `aria-expanded` and shows a chevron that turns down
     * when open. The caller owns the state and the section; pass `aria-controls` to name it.
     */
    expanded?: boolean | undefined;
    href?: undefined;
    render?: undefined;
  } & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>;

type ListRowLinkProps = Shared &
  NotStatic & {
    /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
    external?: boolean | undefined;
    expanded?: undefined;
    /** On the row, not the link, so a link or button in the row does not count as leaving it. */
    onPointerEnter?: PointerEventHandler<HTMLDivElement> | undefined;
    onPointerLeave?: PointerEventHandler<HTMLDivElement> | undefined;
  } & Unstyled<
    Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "onPointerEnter" | "onPointerLeave">
  > &
  (
    | {
        /** Makes the row a link to this URL. */
        href: string;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/quotes/1" {...p} />`. */
        render?: LinkRender | undefined;
      }
    | {
        /** Makes the row a link to this URL. */
        href?: string | undefined;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/quotes/1" {...p} />`. */
        render: LinkRender;
      }
  );

type ListRowStaticProps = Shared & {
  /**
   * A row that is neither a button nor a link, for one that holds its own controls: a `<div>` with
   * no click target and no hover fill (unless `revealOnHover`), taking `actions` as well.
   */
  static: true;
  /** Buttons for this row, after `trailing`: `Button size="sm"`, `IconButton`. */
  actions?: ReactNode | undefined;
  /**
   * Hides `actions` until the row is hovered or something in it has focus, so a long list is not a
   * wall of buttons. A touch screen has no hover, so they are always shown there.
   */
  revealOnHover?: boolean | undefined;
  /**
   * Content under the row, lined up with the label rather than the row's edge (past `leading`): the
   * panel of a row that opens in place, such as a conversation under its chat. It sits inside the
   * row, so `divided`, the fill and `revealOnHover` cover it too. Only a `static` row takes it: a
   * button or a link row cannot hold controls.
   */
  detail?: ReactNode | undefined;
  expanded?: undefined;
  href?: undefined;
  render?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"div">, "children">>;

export type ListRowProps = ListRowButtonProps | ListRowLinkProps | ListRowStaticProps;

type Pieces = { start: ReactNode; label: ReactNode; end: ReactNode };

/** The row's background: the selected fill, else the hover fill unless a plain static row has none. */
function fillOf(props: ListRowProps): string | undefined {
  if (props.selected) return SELECTED;
  if (props.active) return ACTIVE;
  return props.static && !props.revealOnHover ? undefined : FILL;
}

/** `detail={open && <Panel />}` is a common way to write it, so `false` is as empty as `null`. */
function hasDetail(detail: ReactNode): boolean {
  return detail != null && detail !== false;
}

function rowBase(props: ListRowProps): string {
  if (props.static) return hasDetail(props.detail) ? STATIC_DETAIL : STATIC;
  return props.href !== undefined || props.render !== undefined ? LINK_ROW : ROW;
}

function look(props: ListRowProps): string {
  const { size = "md", divided = false, focused = false } = props;
  return cx(
    rowBase(props),
    PAD[size],
    divided && "border-t border-slate-200/70",
    fillOf(props),
    focused && FOCUSED,
  );
}

function StaticRow(props: ListRowStaticProps & Pieces): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    active = false,
    selected,
    size: _s,
    divided: _d,
    static: _st,
    actions,
    revealOnHover = false,
    detail,
    expanded: _e,
    href: _h,
    render: _r,
    start,
    label,
    end,
    ...rest
  } = props;
  const buttons = actions != null && (
    <span className={cx("flex shrink-0 items-center gap-2", revealOnHover && !active && REVEAL)}>
      {actions}
    </span>
  );
  const withDetail = hasDetail(detail);
  return (
    <div
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      className={cx(look(props), withDetail && DETAIL_COLUMNS[start ? "withLeading" : "alone"])}
    >
      {withDetail ? (
        <DetailLines start={start} detail={detail}>
          {label}
          {end}
          {buttons}
        </DetailLines>
      ) : (
        <>
          {start}
          {label}
          {end}
          {buttons}
        </>
      )}
    </div>
  );
}

/** The cells of a static row with `detail`: `start` beside the row's line (its children), over the detail in the label's column. */
function DetailLines({
  start,
  detail,
  children,
}: {
  start: ReactNode;
  detail: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {start}
      <div className="flex min-w-0 items-center gap-3">{children}</div>
      <div className={cx("min-w-0", Boolean(start) && "col-start-2")}>{detail}</div>
    </>
  );
}

function LinkRow(props: ListRowLinkProps & Pieces): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    active: _ac,
    selected,
    expanded: _e,
    size: _s,
    divided: _d,
    static: _st,
    actions: _a,
    revealOnHover: _rh,
    detail: _dt,
    start,
    label,
    end,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;
  const rowId = useId();
  return (
    <div
      id={rowId}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={look(props)}
    >
      {renderLink({
        ...(rest["aria-label"] === undefined ? { "aria-labelledby": rowId } : {}),
        ...rest,
        ...(selected ? { "aria-current": "true" as const } : {}),
        className: OVERLAY,
        children: null,
      })}
      {start}
      {label}
      {end}
    </div>
  );
}

function ButtonRow(props: ListRowButtonProps & Pieces): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    active: _ac,
    selected,
    expanded,
    size: _s,
    divided: _d,
    static: _st,
    actions: _a,
    revealOnHover: _rh,
    detail: _dt,
    href: _h,
    render: _r,
    start,
    label,
    end,
    ...rest
  } = props;
  return (
    <button
      type="button"
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      {...(expanded === undefined ? {} : { "aria-expanded": expanded })}
      className={look(props)}
    >
      {expanded !== undefined && <Chevron open={expanded} />}
      {start}
      {label}
      {end}
    </button>
  );
}

/**
 * A full-width row that is a `<button>` (or, with `href` or `render`, a link) with a hover fill, a
 * left-aligned label and `trailing` content at the far end. A linked row is a `<div>` with the link
 * stretched over it, so the whole row opens the link; a `TextLink`, `Button` or `Checkbox` in the
 * row sits above the link and is clickable on its own. With `expanded` it is the header of a
 * collapsible section: `aria-expanded` and a chevron. Rows sit in a `Card flush`; `divided` draws
 * the line between them, on each row after the first.
 *
 * `secondary` is a second, muted line under the label. `leading` is content before the label (`leadingWidth="thumbnail"` gives it a fixed picture width),
 * `selected` marks the row in view, `focused` the one the keyboard cursor is on and `active` fills
 * the row a list follows (`onPointerEnter`, `onPointerLeave` and `onFocus` reach
 * every form; on a linked row the pointer handlers go on the row itself). The label is a
 * `<div>`, so it can hold block content (a name over a path). `static` makes the
 * row a plain `<div>` for one that holds its own buttons (a button cannot sit inside a button or a
 * link): `actions` follow `trailing`, and `revealOnHover` shows them only on hover or focus.
 * A `static` row also takes `detail`, content under the row that starts where the label does (a
 * conversation that opens under its chat); `divided` draws the line above the whole row, detail
 * included, so a list of them is `divided={index > 0}` on each.
 */
export function ListRow(props: ListRowProps): ReactElement {
  const { leading, leadingWidth, trailing, secondary, children } = props;
  const pieces: Pieces = {
    start: leading != null && (
      <span className={cx("shrink-0", leadingWidth === "thumbnail" && THUMBNAIL)}>{leading}</span>
    ),
    label: (
      <div className="min-w-0 flex-1">
        {children}
        {secondary != null && secondary !== false && (
          <div className="text-xs font-normal text-slate-500">{secondary}</div>
        )}
      </div>
    ),
    end: trailing != null && (
      <span className="shrink-0 tabular-nums text-slate-500">{trailing}</span>
    ),
  };
  if (props.static) return <StaticRow {...props} {...pieces} />;
  if (props.href !== undefined || props.render !== undefined) {
    return <LinkRow {...props} {...pieces} />;
  }
  return <ButtonRow {...props} {...pieces} />;
}
