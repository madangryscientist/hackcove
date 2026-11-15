import {
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import { Chevron } from "./Chevron.js";
import { cx, focusRing, liftInteractive } from "./cx.js";
import { DensityProvider } from "./density.js";
import { renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";
import { GapProvider } from "./stackGap.js";

const ROW_LOOK = "flex w-full items-center gap-3 text-left text-sm text-slate-900";

const INSET_RING = `${focusRing} focus-visible:-outline-offset-2`;

/**
 * A button or linked row is a `relative` box; its button or link is an empty overlay, so the row's
 * own links and buttons are not nested in it.
 */
const LINK_ROW = `relative ${ROW_LOOK} ${liftInteractive}`;

const OVERLAY = `link-stretch absolute inset-0 ${INSET_RING}`;

/** A disabled button row: faded, whatever its fill. Its overlay button is disabled, so the row does not fire. */
const DISABLED = "opacity-50";

const STATIC = "group/row flex w-full items-center gap-3 text-sm text-slate-900";

/**
 * A static row with a `panel`: the row's own line (the label, `trailing`, `actions`) over the panel,
 * `leading` in a column of its own beside both, so the detail starts where the label does.
 */
const STATIC_PANEL = "group/row grid w-full items-center gap-3 text-sm text-slate-900";
const PANEL_COLUMNS = {
  withLeading: "grid-cols-[auto_minmax(0,1fr)]",
  alone: "grid-cols-[minmax(0,1fr)]",
};

const FILL = "hover:bg-slate-50";
const SELECTED = "bg-violet-50 hover:bg-violet-50";
/**
 * The row a pointer or keyboard cursor is on: the inset fill, one step deeper than hover, so it
 * still shows on a `bg-slate-50` surface (a `FullBleedLayout` panel, a toned card).
 */
const HIGHLIGHTED = "bg-slate-100";

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
   * `sm` is dense padding, `lg` one step roomier than `md`. A `Button`, `IconButton` or `Pill` in a
   * `sm` row with no `size` of its own is `sm` too.
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
  highlighted?: boolean | undefined;
  /**
   * A fixed width for `leading`, for a thumbnail (an `<img>` fills it), so the labels of rows with
   * and without a picture still line up. Without it `leading` is as wide as its content.
   */
  leadingWidth?: "thumbnail" | undefined;
  children: ReactNode;
};

type NotStatic = { actions?: undefined; revealOnHover?: undefined; panel?: undefined };

type ListRowButtonProps = Shared &
  NotStatic & {
    /**
     * Makes the row a collapsible header: sets `aria-expanded` and shows a chevron that turns down
     * when open. The caller owns the state and the section; pass `aria-controls` to name it.
     */
    expanded?: boolean | undefined;
    /** What the row does when pressed: it makes the row a button. */
    onClick: MouseEventHandler<HTMLButtonElement>;
    href?: undefined;
    /** On the row, not its button, so a link or button in `trailing` does not count as entering it. */
    onPointerEnter?: PointerEventHandler<HTMLDivElement> | undefined;
    /** On the row, not its button, so a link or button in `trailing` does not count as leaving it. */
    onPointerLeave?: PointerEventHandler<HTMLDivElement> | undefined;
  } & Unstyled<
    Omit<
      ComponentPropsWithoutRef<"button">,
      "children" | "onClick" | "onPointerEnter" | "onPointerLeave"
    >
  >;

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
  > & {
    /** Makes the row a link to this URL; an in-app path goes through the app's `LinkProvider`. */
    href: string;
  };

/**
 * A row with no `href` and no `onClick`: a `<div>` with no click target and no hover fill (unless
 * `revealOnHover`), for one that holds its own controls, taking `actions` as well.
 */
type ListRowStaticProps = Shared & {
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
   * row, so `divided`, the fill and `revealOnHover` cover it too. Only a row that is neither a
   * button nor a link takes it.
   */
  panel?: ReactNode | undefined;
  expanded?: undefined;
  onClick?: undefined;
  href?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"div">, "children" | "onClick">>;

export type ListRowProps = ListRowButtonProps | ListRowLinkProps | ListRowStaticProps;

type Pieces = { start: ReactNode; label: ReactNode; end: ReactNode };

/** A row with no `href` and no `onClick` is static: it does nothing of its own. */
function isStatic(props: ListRowProps): props is ListRowStaticProps {
  return props.href === undefined && props.onClick === undefined;
}

/** The row's background: the selected fill, else the hover fill unless a plain static row has none. */
function fillOf(props: ListRowProps): string | undefined {
  if (props.selected) return SELECTED;
  if (props.highlighted) return HIGHLIGHTED;
  if (isDisabled(props)) return undefined;
  return isStatic(props) && !props.revealOnHover ? undefined : FILL;
}

/** A button row with `disabled`: its button is disabled, so the row fades and takes no hover fill. */
function isDisabled(props: ListRowProps): boolean {
  return !isStatic(props) && "disabled" in props && props.disabled === true;
}

/** `panel={open && <Panel />}` is a common way to write it, so `false` is as empty as `null`. */
function hasPanel(panel: ReactNode): boolean {
  return panel != null && panel !== false;
}

function rowBase(props: ListRowProps): string {
  if (!isStatic(props)) return LINK_ROW;
  return hasPanel(props.panel) ? STATIC_PANEL : STATIC;
}

function look(props: ListRowProps): string {
  const { size = "md", divided = false, focused = false } = props;
  return cx(
    rowBase(props),
    PAD[size],
    divided && "border-t border-slate-200/70",
    fillOf(props),
    isDisabled(props) && DISABLED,
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
    highlighted = false,
    selected,
    size: _s,
    divided: _d,
    actions,
    revealOnHover = false,
    panel,
    expanded: _e,
    onClick: _o,
    href: _h,
    start,
    label,
    end,
    ...rest
  } = props;
  const buttons = actions != null && (
    <span
      className={cx("flex shrink-0 items-center gap-2", revealOnHover && !highlighted && REVEAL)}
    >
      {actions}
    </span>
  );
  const withPanel = hasPanel(panel);
  return (
    <div
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      className={cx(look(props), withPanel && PANEL_COLUMNS[start ? "withLeading" : "alone"])}
    >
      {withPanel ? (
        <PanelLines start={start} panel={panel}>
          {label}
          {end}
          {buttons}
        </PanelLines>
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

/** The cells of a static row with a `panel`: `start` beside the row's line (its children), over the panel in the label's column. */
function PanelLines({
  start,
  panel,
  children,
}: {
  start: ReactNode;
  panel: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {start}
      <div className="flex min-w-0 items-center gap-3">{children}</div>
      <div className={cx("min-w-0", Boolean(start) && "col-start-2")}>{panel}</div>
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
    highlighted: _hl,
    selected,
    expanded: _e,
    size: _s,
    divided: _d,
    actions: _a,
    revealOnHover: _rh,
    panel: _p,
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

function ButtonRow(props: ListRowButtonProps & Pieces & { labelId: string }): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    highlighted: _hl,
    selected,
    expanded,
    size: _s,
    divided: _d,
    actions: _a,
    revealOnHover: _rh,
    panel: _p,
    href: _h,
    start,
    label,
    end,
    labelId,
    children: _c,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;
  return (
    <div onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} className={look(props)}>
      <button
        type="button"
        {...(rest["aria-label"] === undefined ? { "aria-labelledby": labelId } : {})}
        {...rest}
        {...(selected ? { "aria-current": "true" as const } : {})}
        {...(expanded === undefined ? {} : { "aria-expanded": expanded })}
        className={OVERLAY}
      />
      {expanded !== undefined && <Chevron open={expanded} />}
      {start}
      {label}
      {end}
    </div>
  );
}

/**
 * A full-width row that runs `onClick` (or, with `href`, opens a link) with a hover
 * fill, a left-aligned label and `trailing` content at the far end. The row is a `<div>` with its
 * `<button>` or link stretched over it, so a tap anywhere on the row runs it; a `TextLink`,
 * `Button` or `Checkbox` in the row (in `trailing`, say a "View" link on a row that selects) sits
 * above it and is clickable on its own. A button row's button is named by the label alone. With `expanded` it is the header of a
 * collapsible section: `aria-expanded` and a chevron. Rows sit in a `Card flush`; `divided` draws
 * the line between them, on each row after the first.
 *
 * `secondary` is a second, muted line under the label. `leading` is content before the label (`leadingWidth="thumbnail"` gives it a fixed picture width),
 * `selected` marks the row in view, `focused` the one the keyboard cursor is on and `highlighted` fills
 * the row a list follows (`onPointerEnter`, `onPointerLeave` and `onFocus` reach
 * every form; on a button or linked row the pointer handlers go on the row itself). The label is a
 * `<div>`, so it can hold block content (a name over a path). A row with no `href` and no
 * `onClick` is a plain `<div>` with no action of its own, for one that holds its own buttons:
 * `actions` follow `trailing`, and `revealOnHover` shows them only on hover or focus. Such a row
 * also takes a `panel`, content under the row that starts where the label does (a conversation
 * that opens under its chat); `divided` draws the line above the whole row, panel included, so a
 * list of them is `divided={index > 0}` on each. Inside a row a `Stack` is `xs` apart, and a `sm`
 * row makes the buttons in it `sm`.
 */
export function ListRow(props: ListRowProps): ReactElement {
  const labelId = useId();
  return (
    <GapProvider gap="xs">
      <DensityProvider size={props.size === "sm" ? "sm" : undefined}>
        {rowOf(props, labelId)}
      </DensityProvider>
    </GapProvider>
  );
}

/** The row in its form: static with no `href` or `onClick`, a link with `href`, else a button. */
function rowOf(props: ListRowProps, labelId: string): ReactElement {
  if (isStatic(props)) return <StaticRow {...props} {...piecesOf(props)} />;
  if (props.href !== undefined) return <LinkRow {...props} {...piecesOf(props)} />;
  return <ButtonRow {...props} {...piecesOf(props, labelId)} labelId={labelId} />;
}

/** The row's cells. `labelId` names the label, for a button row's button to be labelled by it. */
function piecesOf(props: ListRowProps, labelId?: string): Pieces {
  const { leading, leadingWidth, trailing, secondary, children } = props;
  return {
    start: leading != null && (
      <span className={cx("shrink-0", leadingWidth === "thumbnail" && THUMBNAIL)}>{leading}</span>
    ),
    label: (
      <div id={labelId} className="min-w-0 flex-1">
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
}
